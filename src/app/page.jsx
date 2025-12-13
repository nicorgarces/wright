import Header from "../components/Header";
import ColombianAviationSections from "../components/ColombianAviationSections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <Header />
      <ColombianAviationSections />
    </div>
  );
}
