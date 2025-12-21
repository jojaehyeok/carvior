import { title } from "@/components/primitives";
import CanvasWithText from "@/components/canvas"; // CanvasWithText를 import하세요
import { Textarea } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

export default function HelperPage() {
    return (
        <div className="flex w-full flex-wrap flex-col md:flex-nowrap mb-6 md:mb-0 gap-4">
        <h1 className={title({ color: "violet" })}>헬퍼 센터&nbsp;</h1>
        <Textarea
          maxRows={10}
          label="문의사항"
          placeholder="문의 내용을 적어주세요"
        />
        <Textarea
          minRows={20}
          label="건의하기"
          placeholder="건의사항을 알려주세요"
        />
        <Textarea
          maxRows={10}
          label="세부사항"
          placeholder="세부적인 말씀 있으시면 적어주세요"
        />
        <Button color="success">
            제출하기
        </Button>
      </div>
    );
}