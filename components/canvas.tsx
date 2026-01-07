"use client";
import React, { useRef, useEffect, useState } from "react";
import { Chip, Textarea, Input } from "@nextui-org/react";
import jsPDF from "jspdf";
import "@/public/fonts/NotoSansKR-Bold-normal";

/* ================= 타입 ================= */
type PanelType = "외판" | "내판" | "실내" | "엔진룸";
type TextOption = "X" | "B" | "W" | "A" | "T" | "C" | "U" | "OL";
type Point = { x: number; y: number; text: TextOption };
type UiColor = "red" | "blue" | "purple" | "orange";

/* ================= 상수 ================= */
const COLOR_MAP: Record<TextOption, UiColor> = {
  X: "red",
  B: "purple",
  W: "blue",
  A: "blue",
  T: "blue",
  C: "blue",
  U: "blue",
  OL: "orange",
};

const PANEL_IMAGE: Record<PanelType, string> = {
  외판: "/jindan2.jpg",
  내판: "/jindan1.jpg",
  실내: "/jindan3.jpg",
  엔진룸: "/jindan4.jpg",
};

const TEXT_OPTIONS: Record<PanelType, TextOption[]> = {
  외판: ["X", "B", "W"],
  내판: ["X", "B", "W", "A", "T", "C", "U"],
  실내: ["A", "T", "C", "U"],
  엔진룸: ["OL"],
};

const TEXT_LABEL: Record<TextOption, string> = {
  X: "X 교환",
  B: "B 판금",
  W: "W 용접",
  A: "A 긁힘",
  T: "T 파손",
  C: "C 부식",
  U: "U 찌그러짐",
  OL: "OL 누유",
};

/* ================= 컴포넌트 ================= */
export default function CanvasWithText() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const radius = 50;

  const [selectedPanel, setSelectedPanel] = useState<PanelType>("외판");
  const [selectedText, setSelectedText] = useState<TextOption>("X");
  const [inspector, setInspector] = useState("");
  const [comment, setComment] = useState("");

  const [panelPoints, setPanelPoints] = useState<Record<PanelType, Point[]>>({
    외판: [],
    내판: [],
    실내: [],
    엔진룸: [],
  });

  const [redoStack, setRedoStack] = useState<Record<PanelType, Point[]>>({
    외판: [],
    내판: [],
    실내: [],
    엔진룸: [],
  });

  /* ================= 화면 Canvas ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = PANEL_IMAGE[selectedPanel];

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      panelPoints[selectedPanel].forEach((p) => {
        ctx.fillStyle = COLOR_MAP[p.text];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, p.x, p.y);
      });
    };
  }, [selectedPanel, panelPoints]);

  /* ================= PDF Canvas ================= */
  const drawCanvasForPdf = (panel: PanelType, points: Point[]) =>
    new Promise<HTMLCanvasElement>((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.src = PANEL_IMAGE[panel];

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        points.forEach((p) => {
          ctx.fillStyle = COLOR_MAP[p.text];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "white";
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text, p.x, p.y);
        });

        resolve(canvas);
      };
    });

  /* ================= Canvas 클릭 ================= */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const x = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * canvas.height) / rect.height;

    setPanelPoints((prev) => ({
      ...prev,
      [selectedPanel]: [...prev[selectedPanel], { x, y, text: selectedText }],
    }));

    setRedoStack((prev) => ({ ...prev, [selectedPanel]: [] }));
  };

  /* ================= Undo ================= */
  const undo = () => {
    setPanelPoints((prev) => {
      const last = prev[selectedPanel].slice(-1)[0];
      if (!last) return prev;

      setRedoStack((r) => ({
        ...r,
        [selectedPanel]: [...r[selectedPanel], last],
      }));

      return {
        ...prev,
        [selectedPanel]: prev[selectedPanel].slice(0, -1),
      };
    });
  };

  /* ================= Redo ================= */
  const redo = () => {
    setRedoStack((prev) => {
      const last = prev[selectedPanel].slice(-1)[0];
      if (!last) return prev;

      setPanelPoints((p) => ({
        ...p,
        [selectedPanel]: [...p[selectedPanel], last],
      }));

      return {
        ...prev,
        [selectedPanel]: prev[selectedPanel].slice(0, -1),
      };
    });
  };

  /* ================= PNG ================= */
  const downloadCurrentCanvas = () => {
    const canvas = canvasRef.current!;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${selectedPanel}.png`;
    a.click();
  };

  /* ================= PDF ================= */
  const downloadPdf = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    pdf.setFont("NotoSansKR-Bold", "normal");

    pdf.text(`점검자: ${inspector}`, 15, 15);
    pdf.text(`점검일: ${new Date().toLocaleDateString()}`, 140, 15);

    let y = 25;
    for (const panel of Object.keys(panelPoints) as PanelType[]) {
      const canvas = await drawCanvasForPdf(panel, panelPoints[panel]);
      pdf.text(panel, 15, y);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 15, y + 5, 180, 90);
      y += 105;
      if (y > 240) {
        pdf.addPage();
        y = 20;
      }
    }

    pdf.text("점검자 의견", 15, y);
    pdf.text(comment || "-", 15, y + 8, { maxWidth: 180 });
    pdf.save("성능점검표.pdf");
  };

  /* ================= UI ================= */
  return (
    <div className="p-4 space-y-4">
      <Input label="점검자 이름" value={inspector} onChange={(e) => setInspector(e.target.value)} />

      <div className="flex gap-2">
        {(["외판", "내판", "실내", "엔진룸"] as PanelType[]).map((p) => (
          <Chip key={p} onClick={() => setSelectedPanel(p)}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {TEXT_OPTIONS[selectedPanel].map((opt) => (
          <label
            key={opt}
            className="px-3 py-1 border rounded cursor-pointer"
            style={{
              borderColor: COLOR_MAP[opt],
              backgroundColor: selectedText === opt ? COLOR_MAP[opt] : "transparent",
              color: selectedText === opt ? "white" : COLOR_MAP[opt],
            }}
          >
            <input type="radio" hidden checked={selectedText === opt} onChange={() => setSelectedText(opt)} />
            {TEXT_LABEL[opt]}
          </label>
        ))}
      </div>

      <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full border" />

      <Textarea label="점검자 의견" value={comment} onChange={(e) => setComment(e.target.value)} />

      <div className="flex gap-3">
        <button onClick={downloadCurrentCanvas} className="px-4 py-2 bg-gray-800 text-white rounded">
          현재 패널 PNG
        </button>
        <button onClick={downloadPdf} className="px-4 py-2 bg-blue-600 text-white rounded">
          4패널 PDF
        </button>
      </div>

      {/* Undo */}
      <button onClick={undo} className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full text-xl z-50">
        삭제
      </button>

      {/* Redo */}
      <button onClick={redo} className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full text-xl z-50">
        복원
      </button>
    </div>
  );
}
