import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-dash text-espresso p-4 md:p-6 lg:p-8 font-sans flex flex-col">
            <DashboardHeader />
            <main className="flex-1 flex flex-col min-h-0 mt-6">
                {children}
            </main>
        </div>
    );
}
