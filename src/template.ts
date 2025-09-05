// src/template.ts
export type SeedSection = {
  title: string;
  items: string[];
};

export const TEMPLATE_SEED: SeedSection[] = [
  {
    title: "Vehicle Checklist",
    items: [
      "Engine oil level",
      "Tire pressure (incl. spare)",
      "Tire tread & wear",
      "Brakes responsive / pads ok",
      "Coolant level",
      "Windshield washer fluid",
      "Wipers condition",
      "Headlights / signals / brake lights",
      "Battery terminals clean & tight",
      "Jack, wrench, wheel lock key",
      "Insurance & registration",
      "Roadside assistance card/app",
      "Emergency triangle / flares",
      "Extra water",
    ],
  },
  {
    title: "Packing",
    items: [
      "Clothes (weather-appropriate)",
      "Toiletries",
      "Hormones",
      "Snacks",
      "Water bottle / jug",
      "Sunglasses / hat",
      "Travel pillow / blanket",
      "First-aid kit",
      "Eye drops",
      "Digestives",
      "Vitamins",
      "Pants",
      "Shirts",
      "Underwear",
      "Bathing suits", // (fixed label)
      "Towels",
    ],
  },
  {
    title: "Documents",
    items: [
      "Driver’s license / ID",
      "Passport (if needed)",
      "Itinerary / reservations",
      "Credit card & some cash",
      "Car manual & spare key",
    ],
  },
  {
    title: "Electronics",
    items: ["Kerri phone", "Computer", "Jay phone", "Charger 1", "Roku"],
  },
  {
    title: "Emergency",
    items: [
      "Spare tire / sealant",
      "Jumper cables",
      "Work gloves",
      "Flashlight",
      "Blanket / warm layer",
      "Multi-tool",
    ],
  },
  {
    title: "Cat — meds & supplies",
    items: [
      "Case of food",
      "Liquid (meds)",
      "Inhaler (daily)",
      "Carrier",
      "Litter box",
      "Litter",
      "Zylkene med",
      "2 syringes",
      "Dilator pills",
      "Tablet (med))",
      "Water",
      "Pet (name)",
      "Pet #2 (name)",
    ],
  },
  {
    title: "Luggage",
    items: ["Large luggage", "Medium luggage", "Carry on", "Carry on #2", "Purse/Wallet"],
  },
  {
    title: "Departure",
    items: ["Door", "Patio", "Garbage", "Stove...off", "Food that goes bad", "Water the Plants"],
  },
  { title: "Food", items: ["Water", "Snacks", "Napkins"] },
];
