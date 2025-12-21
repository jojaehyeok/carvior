import { title } from '@/components/primitives';
import { GetServerSideProps } from 'next';

const DashboardPage = () => {
    return (
        <div>
            <h1 className={title({ color: "violet" })}>헬퍼 센터&nbsp;</h1>
        </div>
    );
}


export default DashboardPage