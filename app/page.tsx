"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover,PopoverTrigger,PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, MapPinIcon, CloudRainIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { EventData } from "@/types/weather";
import { useRouter } from "next/navigation";

const Landing = () => {
  const [eventData, setEventData] = useState<Partial<EventData>>({
    location: "",
    date: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.location || !eventData.date) return;
    
    // Store event data in sessionStorage for demo purposes
    sessionStorage.setItem('eventData', JSON.stringify(eventData));
    navigate.push('/dashboard');
  };

  const isFormValid = eventData.location && eventData.date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-[var(--shadow-elevated)]">
            <CloudRainIcon className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Event Weather Risk
            </h1>
            <p className="text-muted-foreground">
              Get weather risk insights for your upcoming event
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="weather-card border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Plan Your Event</CardTitle>
            <CardDescription>Enter your event details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Input */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Event Location
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter city or address"
                    value={eventData.location}
                    onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                    className="pl-10 h-12 text-base rounded-xl border-border/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Date</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 hover:border-primary",
                        !eventData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-4 w-4" />
                      {eventData.date ? format(eventData.date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventData.date}
                      onSelect={(date) => {
                        setEventData({ ...eventData, date });
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-12 text-base font-medium rounded-xl gradient-primary border-0 hover:shadow-[var(--shadow-risk)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Get Weather Risk Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Landing;


