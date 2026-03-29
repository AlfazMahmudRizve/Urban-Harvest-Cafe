export const businessHours = {
    0: { open: "11:30", close: "23:00" }, // Sunday
    1: { open: "11:30", close: "23:00" }, // Monday
    2: { open: "11:30", close: "23:00" }, // Tuesday
    3: { open: "11:30", close: "23:00" }, // Wednesday
    4: { open: "11:30", close: "23:59" }, // Thursday
    5: { open: "15:00", close: "23:00" }, // Friday
    6: { open: "11:30", close: "23:00" }, // Saturday
};

export const SERVICES = ["Delivery", "Takeout", "Dine-in", "In-store pickup"];

export function isStoreOpen(): { isOpen: boolean; nextOpen?: string; message: string } {
    const now = new Date();
    // Offset standard time (UTC) to BD time (UTC+6)
    const dhakaTimeMs = now.getTime() + (6 * 60 * 60 * 1000);
    const dhakaDate = new Date(dhakaTimeMs);

    const day = dhakaDate.getUTCDay() as keyof typeof businessHours;
    const hours = businessHours[day];

    const currentTime = dhakaDate.getUTCHours() * 60 + dhakaDate.getUTCMinutes();
    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);

    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (currentTime >= openTime && currentTime < closeTime) {
        return { isOpen: true, message: "Open Now" };
    }

    return { isOpen: false, message: `Closed. Opens at ${hours.open}` };
}

export function getFormattedHours() {
    return [
        { day: "Mon-Wed", time: "11:30 AM - 11:00 PM" },
        { day: "Thursday", time: "11:30 AM - 11:59 PM" },
        { day: "Friday", time: "03:00 PM - 11:00 PM" },
        { day: "Sat-Sun", time: "11:30 AM - 11:00 PM" },
    ];
}

export function getNextScheduleChange(): Date {
    const now = new Date();
    const dhakaTimeMs = now.getTime() + (6 * 60 * 60 * 1000);
    const dhakaDate = new Date(dhakaTimeMs);
    
    const day = dhakaDate.getUTCDay() as keyof typeof businessHours;
    const hours = businessHours[day];

    const [openH, openM] = hours.open.split(":").map(Number);
    const [closeH, closeM] = hours.close.split(":").map(Number);

    const openTime = new Date(dhakaTimeMs);
    openTime.setUTCHours(openH, openM, 0, 0);

    const closeTime = new Date(dhakaTimeMs);
    closeTime.setUTCHours(closeH, closeM, 0, 0);

    let nextTargetDhaka: Date;

    if (dhakaDate < openTime) {
        nextTargetDhaka = openTime; // Will open later today
    } else if (dhakaDate < closeTime) {
        nextTargetDhaka = closeTime; // Will close later today
    } else {
        // Will open tomorrow
        const tomorrow = new Date(dhakaTimeMs);
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const nextDay = tomorrow.getUTCDay() as keyof typeof businessHours;
        const nextHours = businessHours[nextDay];
        const [nextOpenH, nextOpenM] = nextHours.open.split(":").map(Number);
        tomorrow.setUTCHours(nextOpenH, nextOpenM, 0, 0);
        nextTargetDhaka = tomorrow;
    }
    
    // Convert back from Dhaka relative to true UTC
    const absoluteTimeMs = nextTargetDhaka.getTime() - (6 * 60 * 60 * 1000);
    return new Date(absoluteTimeMs);
}
