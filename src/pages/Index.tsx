import Header from "@/components/Header";
import VehicleCard from "@/components/VehicleCard";
import ActionButtons from "@/components/ActionButtons";
import FinancialStatus from "@/components/FinancialStatus";
import MenuList from "@/components/MenuList";
import BottomNav from "@/components/BottomNav";
import EmergencyFAB from "@/components/EmergencyFAB";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <VehicleCard />
      <ActionButtons />
      <FinancialStatus />
      <MenuList />
      <EmergencyFAB />
      <BottomNav />
    </div>
  );
};

export default Index;
