import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ExternalLink,
  Filter,
  Search,
  BookOpen,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Download
} from "lucide-react";
import { PDFGenerator } from "@/lib/pdf-utils";

interface Event {
  id: string;
  title: string;
  type: 'workshop' | 'seminar' | 'internship' | 'conference' | 'hackathon';
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  rating: number;
  relevanceScore: number;
  url: string;
}

export default function EventSuggestions() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Mock events data - in real implementation, this would come from an API
  const mockEvents: Event[] = [
    {
      id: "evt_1",
      title: "React Advanced Workshop",
      type: "workshop",
      description: "Learn advanced React patterns, hooks, and performance optimization techniques.",
      date: "2024-02-15",
      time: "10:00 AM",
      location: "Tech Hub, Downtown",
      organizer: "React Community",
      skills: ["React", "JavaScript", "Frontend Development"],
      difficulty: "intermediate",
      duration: "8 hours",
      maxParticipants: 30,
      currentParticipants: 18,
      price: 150,
      rating: 4.8,
      relevanceScore: 95,
      url: "https://example.com/react-workshop"
    },
    {
      id: "evt_2",
      title: "Data Science Internship Program",
      type: "internship",
      description: "6-month paid internship focusing on machine learning and data analysis projects.",
      date: "2024-03-01",
      time: "9:00 AM",
      location: "DataCorp Inc.",
      organizer: "DataCorp Inc.",
      skills: ["Python", "Machine Learning", "Data Analysis", "Statistics"],
      difficulty: "intermediate",
      duration: "6 months",
      maxParticipants: 10,
      currentParticipants: 3,
      price: 0,
      rating: 4.9,
      relevanceScore: 88,
      url: "https://example.com/datacorp-internship"
    },
    {
      id: "evt_3",
      title: "AI & ML Conference 2024",
      type: "conference",
      description: "Annual conference featuring latest trends in artificial intelligence and machine learning.",
      date: "2024-04-20",
      time: "9:00 AM",
      location: "Convention Center",
      organizer: "AI Society",
      skills: ["Machine Learning", "Artificial Intelligence", "Deep Learning"],
      difficulty: "advanced",
      duration: "3 days",
      maxParticipants: 500,
      currentParticipants: 320,
      price: 300,
      rating: 4.7,
      relevanceScore: 82,
      url: "https://example.com/ai-conference"
    },
    {
      id: "evt_4",
      title: "Web Development Bootcamp",
      type: "workshop",
      description: "Intensive 12-week bootcamp covering full-stack web development.",
      date: "2024-02-01",
      time: "9:00 AM",
      location: "Code Academy",
      organizer: "Code Academy",
      skills: ["HTML", "CSS", "JavaScript", "Node.js", "React", "MongoDB"],
      difficulty: "beginner",
      duration: "12 weeks",
      maxParticipants: 25,
      currentParticipants: 22,
      price: 2000,
      rating: 4.6,
      relevanceScore: 75,
      url: "https://example.com/web-bootcamp"
    },
    {
      id: "evt_5",
      title: "UX Design Hackathon",
      type: "hackathon",
      description: "48-hour hackathon focused on creating innovative UX solutions for social impact.",
      date: "2024-03-15",
      time: "6:00 PM",
      location: "Design Studio",
      organizer: "UX Designers Guild",
      skills: ["UI/UX Design", "Figma", "User Research", "Prototyping"],
      difficulty: "intermediate",
      duration: "48 hours",
      maxParticipants: 50,
      currentParticipants: 35,
      price: 25,
      rating: 4.5,
      relevanceScore: 70,
      url: "https://example.com/ux-hackathon"
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, typeFilter, difficultyFilter, events]);

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(event => event.difficulty === difficultyFilter);
    }

    setFilteredEvents(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return BookOpen;
      case 'internship': return Briefcase;
      case 'conference': return GraduationCap;
      case 'hackathon': return Users;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop': return "bg-blue-100 text-blue-800";
      case 'internship': return "bg-green-100 text-green-800";
      case 'conference': return "bg-purple-100 text-purple-800";
      case 'hackathon': return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return "text-green-600";
      case 'intermediate': return "text-yellow-600";
      case 'advanced': return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  const downloadEvents = async () => {
    const eventData = {
      events: filteredEvents,
      generatedAt: new Date().toISOString(),
      totalCount: filteredEvents.length
    };
    
    await PDFGenerator.generateEventPDF(eventData, `event-suggestions-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Suggestions</h1>
          <p className="text-muted-foreground">Discover workshops, internships, and events tailored to your profile</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadEvents} disabled={filteredEvents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF ({filteredEvents.length})
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="internship">Internships</SelectItem>
                  <SelectItem value="conference">Conferences</SelectItem>
                  <SelectItem value="hackathon">Hackathons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Recommended Events ({filteredEvents.length})
          </h3>
        </div>

        {filteredEvents.map((event) => {
          const TypeIcon = getTypeIcon(event.type);
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <TypeIcon className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge variant="outline" className={getRelevanceColor(event.relevanceScore)}>
                      {event.relevanceScore}% match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{event.date}</p>
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{event.location}</p>
                      <p className="text-xs text-muted-foreground">{event.organizer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{event.duration}</p>
                      <p className={`text-xs font-medium ${getDifficultyColor(event.difficulty)}`}>
                        {event.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {event.currentParticipants}/{event.maxParticipants}
                      </p>
                      <p className="text-xs text-muted-foreground">participants</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Skills Covered:</p>
                    <div className="flex flex-wrap gap-1">
                      {event.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{event.rating}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">${event.price}</span>
                        {event.price === 0 && (
                          <span className="text-green-600 ml-1">(Free)</span>
                        )}
                      </div>
                    </div>
                    <Button asChild>
                      <a href={event.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later for new events</p>
        </div>
      )}
    </div>
  );
}
