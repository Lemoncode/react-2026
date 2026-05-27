import type { FullMainPageVm } from "./home.vm";

interface HomeProps {
  content: FullMainPageVm;
}

export const Home: React.FC<HomeProps> = ({ content }) => {
  return (
    <div>
      <h1>{content.headerSection.villaName}</h1>
    </div>
  );
};
