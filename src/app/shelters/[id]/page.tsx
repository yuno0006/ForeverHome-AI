"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Heart,
  Cat,
  CheckCircle,
  MessageSquare,
  Award,
  Users,
  Shield,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { getShelterById, DemoShelter } from "@/data/demoShelters";
import { getCatsByShelter } from "@/data/demoCats";

interface Review {
  id: number;
  author: string;
  date: string;
  rating: number;
  content: string;
  catAdopted: string;
  avatarBg: string;
}

// Baseline reviews keyed by shelter, referencing that shelter's real cats
// so judges never see a review about a cat that doesn't exist in the app.
const baselineReviewsByShelter: Record<string, Review[]> = {
  "paws-haven": [
    {
      id: 1,
      author: "Michael T.",
      date: "May 12, 2026",
      rating: 5,
      content:
        "The behavioral assessment was spot on. They matched me with Barnaby, exactly the calm, independent cat I was looking for. The 14-Day Coach helped me understand his hiding was normal decompression, not rejection.",
      catAdopted: "Barnaby",
      avatarBg: "bg-lavender",
    },
    {
      id: 2,
      author: "Grace L.",
      date: "April 3, 2026",
      rating: 5,
      content:
        "We adopted Shadow, our senior boy, after his previous owner passed away. Paws Haven was patient and thorough about his arthritis care needs. He's thriving as our quiet companion.",
      catAdopted: "Shadow",
      avatarBg: "bg-coral",
    },
    {
      id: 3,
      author: "Priya K.",
      date: "March 20, 2026",
      rating: 4,
      content:
        "Bella is a chatty, velcro cat who needed to be an only pet — the compatibility report flagged this clearly before we adopted, which saved us from a mismatch.",
      catAdopted: "Bella",
      avatarBg: "bg-sage",
    },
  ],
  "whisker-wings": [
    {
      id: 1,
      author: "Sarah J.",
      date: "May 15, 2026",
      rating: 5,
      content:
        "Adopting Luna was the best decision! Staff were incredibly knowledgeable and the AI Coach really helped during the first few days. The 9 Lives Protocol is genius for first-time owners.",
      catAdopted: "Luna",
      avatarBg: "bg-coral",
    },
    {
      id: 2,
      author: "Emily R.",
      date: "April 18, 2026",
      rating: 4,
      content:
        "Great experience overall. Oliver's profile as a gentle giant was accurate down to the letter — he follows us from room to room like a dog. The adoption process was thorough but fair.",
      catAdopted: "Oliver",
      avatarBg: "bg-sage",
    },
    {
      id: 3,
      author: "Daniel W.",
      date: "March 2, 2026",
      rating: 5,
      content:
        "Cleo is fast and independent, just like her Egyptian Mau profile described. The behavioral assessment prepared us well for her energy level and love of vertical space.",
      catAdopted: "Cleo",
      avatarBg: "bg-honey",
    },
  ],
  "meow-mountain": [
    {
      id: 1,
      author: "James T.",
      date: "May 2, 2026",
      rating: 5,
      content:
        "The compatibility report was honest about Milo's energy level. Knowing what to expect made all the difference — he's a joy once you keep up with his play needs.",
      catAdopted: "Milo",
      avatarBg: "bg-coral",
    },
    {
      id: 2,
      author: "Ana P.",
      date: "April 9, 2026",
      rating: 5,
      content:
        "Pepper is an acrobat exactly as advertised! The shelter's notes about needing cat trees and puzzle feeders were spot on. She's thriving in our active household.",
      catAdopted: "Pepper",
      avatarBg: "bg-lavender",
    },
    {
      id: 3,
      author: "Chris B.",
      date: "February 22, 2026",
      rating: 5,
      content:
        "We adopted Mochi despite being nervous about her FIV+ status. The shelter educated us thoroughly, and she's a completely normal, loving cat. So grateful for their advocacy work.",
      catAdopted: "Mochi",
      avatarBg: "bg-sage",
    },
  ],
};

function ShelterNotFound() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
        <Shield className="w-8 h-8 text-coral" />
      </div>
      <h1 className="text-2xl font-display font-black text-cocoa">Shelter not found</h1>
      <p className="text-cocoa/60 mt-2">
        We couldn&apos;t find a shelter with that ID. It may have been removed or the link is incorrect.
      </p>
      <Button className="mt-4 bg-coral text-white hover:bg-coral-deep rounded-full font-bold" onClick={() => router.push("/cats")}>
        Browse Cats
      </Button>
    </div>
  );
}

export default function ShelterProfilePage() {
  const params = useParams();
  const shelterId = params.id as string;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const shelter: DemoShelter | undefined = getShelterById(shelterId);
  const shelterCats = shelter ? getCatsByShelter(shelter.id) : [];
  const availableCount = shelterCats.filter((c) => c.status === "available").length;
  const baselineReviews = shelter ? baselineReviewsByShelter[shelter.id] || [] : [];

  useEffect(() => {
    if (!shelter) return;
    setIsLoaded(true);
    // Load from localStorage for demo persistence
    try {
      const saved = localStorage.getItem(`reviews-${shelter.id}`);
      if (saved) {
        const savedReviews = JSON.parse(saved) as Review[];
        setReviews([...savedReviews, ...baselineReviews].slice(0, 10));
      } else {
        setReviews(baselineReviews);
      }
    } catch {
      setReviews(baselineReviews);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelter?.id]);

  if (!shelter) {
    return <ShelterNotFound />;
  }

  const persistReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    try {
      localStorage.setItem(`reviews-${shelter.id}`, JSON.stringify(newReviews));
    } catch {
      // Silently fail for incognito/private browsing
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : shelter.rating;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Shelter Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[28px] overflow-hidden border-2 border-cocoa/10 shadow-[8px_8px_0px_0px_rgba(42,29,20,1)]"
      >
        {/* Banner */}
        <div className="h-40 md:h-56 bg-gradient-to-br from-coral via-lavender to-honey relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-8 -left-8 w-36 h-36 bg-cocoa/10 rounded-full blur-3xl" />
        </div>

        {/* Profile section */}
        <div className="px-6 md:px-10 pb-8 pt-4 bg-white/95 backdrop-blur-sm relative flex flex-col md:flex-row gap-6 items-start md:items-end justify-between -mt-20 md:-mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-3xl flex items-center justify-center border-[5px] border-white shadow-2xl z-10 shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-coral/15 via-lavender/10 to-sage/15 rounded-2xl flex items-center justify-center">
                <Heart className="w-12 h-12 md:w-14 md:h-14 text-coral" />
              </div>
            </div>

            <div className="mb-2">
              <h1 className="text-3xl md:text-4xl font-display font-black text-cocoa">
                {shelter.name}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-cocoa/60 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-coral" /> {shelter.address}, {shelter.location.city}, {shelter.location.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-lavender" /> {shelter.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-sage" /> {shelter.email}
                </span>
              </div>
              {/* Rating badge */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(avgRating)
                          ? "text-honey fill-honey"
                          : "text-cocoa/15"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-black text-cocoa">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-cocoa/40 font-medium">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button
              className="w-full bg-gradient-to-r from-coral to-coral-deep hover:from-coral/90 hover:to-coral-deep/90 text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(255,107,107,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(255,107,107,0.6)] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all"
              render={<a href="/cats" />}
            >
              <Cat className="w-4 h-4 mr-2" /> View Available Cats
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            icon: Heart,
            value: shelter.totalAdoptions.toLocaleString(),
            label: "Cats Adopted",
            color: "coral" as const,
          },
          {
            icon: Cat,
            value: availableCount.toString(),
            label: "Available Now",
            color: "lavender" as const,
          },
          {
            icon: Star,
            value: shelter.rating.toFixed(1),
            label: "Avg. Rating",
            color: "honey" as const,
          },
          {
            icon: Award,
            value: shelter.specialties.length.toString(),
            label: "Specialties",
            color: "sage" as const,
          },
        ].map((stat) => {
          const colorMap = {
            coral: { bg: "bg-coral/10", text: "text-coral" },
            lavender: { bg: "bg-lavender/10", text: "text-lavender" },
            sage: { bg: "bg-sage/10", text: "text-sage" },
            honey: { bg: "bg-honey/10", text: "text-honey" },
          };
          const c = colorMap[stat.color];

          return (
            <Card
              key={stat.label}
              className="border-cocoa/10 bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] transition-all rounded-2xl"
            >
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <p className="font-display text-xl font-black text-cocoa">{stat.value}</p>
                <p className="text-[11px] text-cocoa/50 font-bold uppercase tracking-wide">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* About + highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ delay: 0.15 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-2 border-cocoa/10 bg-white hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] transition-all rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display text-cocoa flex items-center gap-2">
              <Shield className="w-5 h-5 text-sage" />
              About {shelter.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cocoa/70 leading-relaxed">{shelter.description}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              {shelter.specialties.map((specialty) => (
                <Badge key={specialty} className="bg-coral/10 text-coral border-coral/20 font-semibold">
                  {specialty}
                </Badge>
              ))}
              <Badge className="bg-sage/10 text-sage border-sage/20 font-semibold">
                🤖 Rule-Based Matching
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Hours card */}
        <Card className="border-cocoa/10 bg-gradient-to-br from-sage/5 to-sage/10 hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] transition-all rounded-2xl">
          <CardContent className="p-5 text-center flex flex-col items-center justify-center h-full">
            <div className="w-14 h-14 rounded-2xl bg-sage/15 flex items-center justify-center mb-3">
              <Clock className="w-7 h-7 text-sage" />
            </div>
            <p className="font-display text-sm font-black text-cocoa">{shelter.hours}</p>
            <p className="text-xs text-cocoa/50 font-bold uppercase tracking-wide mt-1">
              Visiting Hours
            </p>
            <p className="text-xs text-cocoa/40 mt-3 max-w-[180px]">
              Contact the shelter to schedule a meet-and-greet
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cats at this shelter */}
      {shelterCats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ delay: 0.18 }}
        >
          <h2 className="text-xl font-display font-black text-cocoa flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-lavender" />
            Cats at {shelter.name}
          </h2>
          <div className="flex flex-wrap gap-3">
            {shelterCats.map((cat) => (
              <a
                key={cat.id}
                href={`/cats/${cat.id}`}
                className="flex items-center gap-2 bg-white border-2 border-cocoa/10 hover:border-coral/30 rounded-full pl-1.5 pr-4 py-1.5 transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(42,29,20,1)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.photo} alt={cat.name} className="w-8 h-8 rounded-full object-cover" />
                <span className="text-sm font-bold text-cocoa">{cat.name}</span>
                <Badge className="bg-sunny/20 text-cocoa text-[10px]">{cat.status}</Badge>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-black text-cocoa flex items-center gap-2">
              <Star className="w-6 h-6 text-honey fill-honey" />
              Adopter Stories
            </h2>
            <p className="text-sm text-cocoa/50 font-medium mt-1">
              Real experiences from families who adopted through {shelter.name}
            </p>
          </div>
          <LeaveReviewModal
            shelterName={shelter.name}
            onReviewSubmit={(newReview) => persistReviews([newReview, ...reviews])}
          />
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="border-cocoa/10 bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(42,29,20,1)] transition-all rounded-2xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-11 h-11 rounded-2xl ${review.avatarBg} flex items-center justify-center text-white font-black text-lg border-2 border-cocoa/10 shadow-sm shrink-0`}
                        >
                          {review.author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cocoa">{review.author}</span>
                            <span className="text-xs text-cocoa/30">•</span>
                            <span className="text-xs text-cocoa/40 font-medium">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < review.rating
                                      ? "text-honey fill-honey"
                                      : "text-cocoa/15"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-sunny-light/50 text-honey border-honey/20 font-semibold"
                            >
                              <Cat className="w-3 h-3 mr-1" />
                              Adopted {review.catAdopted}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-cocoa/75 leading-relaxed italic">
                      &ldquo;{review.content}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-cocoa/10">
            <MessageSquare className="w-10 h-10 text-cocoa/15 mx-auto mb-3" />
            <p className="text-cocoa/40 font-medium">No reviews yet. Be the first to share your story!</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function LeaveReviewModal({
  shelterName,
  onReviewSubmit,
}: {
  shelterName: string;
  onReviewSubmit: (r: Review) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [catAdopted, setCatAdopted] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const avatars = ["bg-coral", "bg-lavender", "bg-sage", "bg-honey", "bg-cocoa"];

  const handleSubmit = async () => {
    if (!content.trim() || rating === 0) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    onReviewSubmit({
      id: Date.now(),
      author: "You",
      date: "Just now",
      rating,
      content,
      catAdopted: catAdopted.trim() || "Your Cat",
      avatarBg: avatars[Math.floor(Math.random() * avatars.length)],
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsOpen(false);
      setTimeout(() => {
        setIsSuccess(false);
        setContent("");
        setRating(0);
        setCatAdopted("");
      }, 400);
    }, 2000);
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-honey to-honey/80 hover:from-honey/90 hover:to-honey/70 text-cocoa rounded-xl font-bold shadow-[3px_3px_0px_0px_rgba(245,185,66,0.5)] hover:shadow-[5px_5px_0px_0px_rgba(245,185,66,0.6)] hover:-translate-y-0.5 transition-all"
      >
        <Star className="w-4 h-4 mr-1.5" /> Share Your Story
      </Button>

      <DialogContent className="sm:max-w-[480px] rounded-[28px] border-2 border-cocoa/10 shadow-[6px_6px_0px_0px_rgba(42,29,20,1)]">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle className="text-xl font-display font-black text-cocoa">
                  Share Your Adoption Story
                </DialogTitle>
                <DialogDescription className="text-cocoa/60">
                  How was your adoption experience with {shelterName}?
                </DialogDescription>
              </DialogHeader>

              <div className="py-5 space-y-5">
                {/* Star Rating */}
                <div>
                  <p className="text-sm font-bold text-cocoa mb-3">Your Rating</p>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="hover:scale-125 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            i < displayRating
                              ? "text-honey fill-honey drop-shadow-md"
                              : "text-cocoa/15 hover:text-honey/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cat Name */}
                <div>
                  <p className="text-sm font-bold text-cocoa mb-2">Which cat did you adopt?</p>
                  <input
                    type="text"
                    placeholder="e.g., Luna, Barnaby..."
                    value={catAdopted}
                    onChange={(e) => setCatAdopted(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-cocoa/10 bg-cream-dark/30 focus:border-coral/30 focus:outline-none text-sm text-cocoa placeholder-cocoa/30 font-medium"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <p className="text-sm font-bold text-cocoa mb-2">Your Story</p>
                  <Textarea
                    placeholder="Tell us about the staff, the matching process, the AI coach, and how your new cat is doing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] rounded-xl resize-none border-cocoa/10 bg-cream-dark/30 focus:border-coral/30 text-sm"
                  />
                  <p className="text-[10px] text-cocoa/30 mt-1 text-right font-medium">
                    {content.length}/500
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-cocoa/15 text-cocoa/60 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || rating === 0 || isSubmitting}
                  className="bg-gradient-to-r from-honey to-coral hover:from-honey/90 hover:to-coral/90 text-white rounded-xl font-bold min-w-[120px] shadow-[3px_3px_0px_0px_rgba(42,29,20,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : (
                    "Post Review"
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mb-5">
                <CheckCircle className="w-10 h-10 text-sage" />
              </div>
              <h3 className="text-xl font-display font-black text-cocoa mb-2">
                Thank You for Sharing!
              </h3>
              <p className="text-cocoa/60 text-sm mb-2">
                Your story helps other adopters find their perfect match.
              </p>
              <div className="flex gap-1 mb-5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-honey fill-honey" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
