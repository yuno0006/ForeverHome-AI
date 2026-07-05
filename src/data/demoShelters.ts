import { Shelter } from "@/types/shelter";

// Demo shelters for hackathon judging
// Each shelter has unique identity and cats available for adoption

export interface DemoShelter extends Omit<Shelter, 'createdAt'> {
  description: string;
  location: {
    city: string;
    state: string;
    neighborhood?: string;
  };
  hours: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
  };
  specialties: string[];
  totalAdoptions: number;
  rating: number;
  createdAt?: Date;
}

export const demoShelters: DemoShelter[] = [
  {
    id: "paws-haven",
    name: "Paws Haven Rescue",
    description: "A no-kill sanctuary dedicated to rescuing and rehabilitating cats from difficult situations. We specialize in shy and special needs cats, giving them the time and care they need to find their forever homes.",
    address: "123 Maple Street",
    phone: "(555) 123-4567",
    email: "adopt@pawshaven.org",
    adminUid: "demo-admin-1",
    logoUrl: null,
    location: {
      city: "Portland",
      state: "OR",
      neighborhood: "Pearl District"
    },
    hours: "Mon-Sat 10am-6pm, Sun 12pm-5pm",
    website: "https://pawshaven.org",
    socialMedia: {
      instagram: "@pawshaven_rescue",
      facebook: "pawshavenrescue"
    },
    specialties: ["Special Needs Cats", "Shy Cat Rehabilitation", "Senior Cat Care"],
    totalAdoptions: 847,
    rating: 4.9
  },
  {
    id: "whisker-wings",
    name: "Whiskers & Wings Sanctuary",
    description: "A family-run rescue focused on creating perfect matches between cats and adopters. Our behavioral assessment program ensures each cat finds their ideal home environment.",
    address: "456 Oak Avenue",
    phone: "(555) 234-5678",
    email: "hello@whiskersandwings.org",
    adminUid: "demo-admin-2",
    logoUrl: null,
    location: {
      city: "Seattle",
      state: "WA",
      neighborhood: "Capitol Hill"
    },
    hours: "Tue-Sun 11am-7pm",
    website: "https://whiskersandwings.org",
    socialMedia: {
      instagram: "@whiskerswings"
    },
    specialties: ["Behavioral Assessment", "Kitten Socialization", "Bonded Pairs"],
    totalAdoptions: 1203,
    rating: 4.8
  },
  {
    id: "meow-mountain",
    name: "Meow Mountain Rescue",
    description: "High-energy rescue for adventurous cats and active families. We specialize in matching playful cats with owners who love enrichment activities and interactive play.",
    address: "789 Pine Road",
    phone: "(555) 345-6789",
    email: "adopt@meowmountain.org",
    adminUid: "demo-admin-3",
    logoUrl: null,
    location: {
      city: "Denver",
      state: "CO",
      neighborhood: "Highland"
    },
    hours: "Wed-Mon 10am-5pm",
    website: "https://meowmountain.org",
    specialties: ["High-Energy Cats", "Working Cat Programs", "FIV+ Advocacy"],
    totalAdoptions: 562,
    rating: 4.7
  }
];

export function getShelterById(id: string): DemoShelter | undefined {
  return demoShelters.find((shelter) => shelter.id === id);
}

export function getSheltersByCat(catId: string): DemoShelter | undefined {
  // Map cats to shelters
  const catShelterMap: Record<string, string> = {
    "barnaby": "paws-haven",
    "luna": "whisker-wings", 
    "milo": "meow-mountain",
    "shadow": "paws-haven",
    "pepper": "meow-mountain",
    "mochi": "meow-mountain",
    "cleo": "whisker-wings",
    "oliver": "whisker-wings",
    "bella": "paws-haven"
  };
  
  const shelterId = catShelterMap[catId];
  return shelterId ? getShelterById(shelterId) : undefined;
}
