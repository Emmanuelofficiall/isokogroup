import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TrackingTimeline from "@/components/TrackingTimeline";
import { Search } from "lucide-react";

const Track = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(trackingNumber || "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-6">Enter your tracking number to see real-time status updates.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate(`/track/${input.trim()}`); }}
          className="flex gap-2 mb-8"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="TRK-XXXXXXXXXX" className="font-mono" />
          <Button type="submit"><Search className="h-4 w-4 mr-1" /> Track</Button>
        </form>

        {trackingNumber && (
          <Card>
            <CardHeader><CardTitle>Shipment Status</CardTitle></CardHeader>
            <CardContent>
              <TrackingTimeline trackingNumber={trackingNumber} />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Track;
