import Link from "next/link";
import { demoCats } from "@/data/demoCats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, BarChart3, Heart, Sparkles } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const availableCats = demoCats.filter((c) => c.status === "available");
  const adoptedCats = demoCats.filter((c) => c.status === "adopted");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-cat-dark">Shelter Dashboard</h1>
          <p className="text-charcoal/50 mt-1">
            Manage cats, view assessments, and track adoptions
          </p>
        </div>
        <Link href="/cats">
          <Button className="bg-sunny hover:bg-sunny/90 text-cat-dark font-semibold rounded-xl shadow-sm shadow-sunny/20">
            <Plus className="h-4 w-4 mr-2" />
            View All Cats
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Cats", value: demoCats.length, icon: Heart, color: "bg-sunny/15 text-sunny" },
          { label: "Available", value: availableCats.length, icon: Eye, color: "bg-risk-low/15 text-risk-low" },
          { label: "Adopted", value: adoptedCats.length, icon: Sparkles, color: "bg-heart-light text-heart" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white border-sunny/15 rounded-2xl">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-cat-dark">{stat.value}</p>
                  <p className="text-sm text-charcoal/50">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cat Grid */}
      <h2 className="text-xl font-bold text-cat-dark mb-4">All Cats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {demoCats.map((cat) => (
          <Card
            key={cat.id}
            className="bg-white border-sunny/15 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.photo}
                alt={cat.name}
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <span
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  cat.status === "available"
                    ? "bg-sunny text-cat-dark"
                    : cat.status === "adopted"
                    ? "bg-heart text-white"
                    : "bg-risk-moderate text-cat-dark"
                }`}
              >
                {cat.status}
              </span>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-cat-dark">{cat.name}</h3>
                <span className="text-sm text-charcoal/50">{cat.age} yrs</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 bg-sunny-light text-cat-dark text-xs rounded-full font-medium">
                  {cat.behavior.energy} energy
                </span>
                <span className="px-2 py-0.5 bg-sunny-light text-cat-dark text-xs rounded-full font-medium">
                  {cat.behavior.stressSensitivity} stress
                </span>
                {cat.care.knownMedicalNeeds !== "None" && (
                  <span className="px-2 py-0.5 bg-heart-light text-heart text-xs rounded-full font-medium">
                    medical needs
                  </span>
                )}
              </div>
              <p className="text-sm text-charcoal/50 line-clamp-2 mb-3 leading-relaxed">
                {cat.care.specialNotes}
              </p>
              <div className="flex gap-2">
                <Link href={`/cats?cat=${cat.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-sunny/20 text-cat-dark rounded-xl hover:bg-sunny-light">
                    <Eye className="h-3 w-3 mr-1" /> Profile
                  </Button>
                </Link>
                <Link href={`/assessment/${cat.id}`} className="flex-1">
                  <Button size="sm" className="w-full bg-sunny hover:bg-sunny/90 text-cat-dark rounded-xl font-semibold">
                    <BarChart3 className="h-3 w-3 mr-1" /> Assess
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Story Section */}
      <Card className="bg-sunny/10 border-sunny/20 rounded-2xl">
        <CardContent className="pt-6">
          <h3 className="font-bold text-cat-dark mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sunny" />
            Demo Scenarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              { pair: "Sarah + Barnaby", desc: "Family with toddlers + stress-sensitive cat", risk: "HIGH RISK", riskColor: "bg-risk-high/10 text-risk-high" },
              { pair: "Alex + Barnaby", desc: "Quiet remote worker + stress-sensitive cat", risk: "LOW RISK", riskColor: "bg-risk-low/10 text-risk-low" },
              { pair: "Emma + Shadow", desc: "Long hours + senior cat with medical needs", risk: "HIGH RISK", riskColor: "bg-risk-high/10 text-risk-high" },
              { pair: "Michael + Pepper", desc: "Experienced owner + high-energy cat", risk: "LOW RISK", riskColor: "bg-risk-low/10 text-risk-low" },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-sunny/15">
                <p className="font-semibold text-cat-dark">{item.pair}</p>
                <p className="text-charcoal/50 text-xs mt-0.5">{item.desc}</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full font-semibold ${item.riskColor}`}>
                  {item.risk}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
