import { DemoStage } from '../components/DemoStage';

export const metadata = {
  title: 'Rust in de Drukte',
  description: 'Een rustige minuut te midden van alles.',
};

export default function DutchPage() {
  return <DemoStage locale="nl" />;
}
