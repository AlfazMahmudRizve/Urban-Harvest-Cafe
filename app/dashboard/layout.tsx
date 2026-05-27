import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dash text-cream-warm p-6 md:p-8 font-sans pb-32">
            <DashboardHeader />
            {children}
        </div>
    );
}
