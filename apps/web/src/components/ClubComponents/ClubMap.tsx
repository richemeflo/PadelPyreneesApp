import type { ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Maximize2, 
  Minimize2,
  Car,
  Wifi,
  Coffee,
  ShoppingBag,
  Navigation
} from 'lucide-react';
import { ClubInfo } from '../types/reservation';

interface ClubMapProps {
  clubInfo: ClubInfo;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ClubMap({ clubInfo, isExpanded = false, onToggleExpand }: ClubMapProps) {
  const getCurrentDay = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  };

  const getCurrentHours = () => {
    const today = getCurrentDay();
    return clubInfo.openingHours[today] || 'Fermé';
  };

  const isOpenNow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const todayHours = getCurrentHours();
    if (todayHours === 'Fermé') return false;
    
    const [openTime, closeTime] = todayHours.split(' - ');
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, ReactElement> = {
      'Parking gratuit': <Car className="h-4 w-4" />,
      'WiFi gratuit': <Wifi className="h-4 w-4" />,
      'Snack-bar': <Coffee className="h-4 w-4" />,
      'Boutique équipements': <ShoppingBag className="h-4 w-4" />
    };
    return iconMap[amenity] || <MapPin className="h-4 w-4" />;
  };

  const openInMaps = () => {
    const { lat, lng } = clubInfo.location;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className={isExpanded ? 'fixed inset-4 z-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localisation du Club
          </CardTitle>
          {onToggleExpand && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleExpand}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations du club */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">{clubInfo.name}</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{clubInfo.address}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${clubInfo.phone}`} className="hover:underline">
                  {clubInfo.phone}
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${clubInfo.email}`} className="hover:underline">
                  {clubInfo.email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Horaires du {getCurrentDay()}</span>
                <Badge className={isOpenNow() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isOpenNow() ? 'Ouvert' : 'Fermé'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{getCurrentHours()}</p>
            </div>

            <Button onClick={openInMaps} variant="outline" size="sm" className="w-full">
              <Navigation className="h-4 w-4 mr-2" />
              Itinéraire
            </Button>
          </div>
        </div>

        {/* Carte simulée */}
        <div className={`relative bg-muted rounded-lg overflow-hidden ${isExpanded ? 'h-96' : 'h-64'}`}>
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 relative">
            {/* Marqueur du club */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg p-2 shadow-lg min-w-32">
                <div className="text-xs font-medium">{clubInfo.name}</div>
                <div className="text-xs text-muted-foreground">{clubInfo.address.split(',')[0]}</div>
              </div>
            </div>

            {/* Contrôles simulés */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="secondary" size="sm" className="w-8 h-8 p-0">+</Button>
              <Button variant="secondary" size="sm" className="w-8 h-8 p-0">-</Button>
            </div>
          </div>

          {/* Overlay d'informations */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>PadelConnect Club Paris</span>
              </div>
              <span className="text-muted-foreground">Distance: 2.3 km</span>
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="space-y-3">
          <h4 className="font-medium">Équipements & Services</h4>
          <div className="grid grid-cols-2 gap-2">
            {clubInfo.amenities.slice(0, 8).map((amenity, index) => (
              <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-lg">
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
          {clubInfo.amenities.length > 8 && (
            <p className="text-xs text-muted-foreground">
              Et {clubInfo.amenities.length - 8} autre(s) service(s)...
            </p>
          )}
        </div>

        {/* Horaires détaillés */}
        <div className="space-y-3">
          <h4 className="font-medium">Horaires d'ouverture</h4>
          <div className="grid grid-cols-1 gap-1 text-sm">
            {Object.entries(clubInfo.openingHours).map(([day, hours]) => {
              const isToday = day === getCurrentDay();
              return (
                <div 
                  key={day} 
                  className={`flex justify-between py-1 px-2 rounded ${
                    isToday ? 'bg-primary/10 font-medium' : ''
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-muted-foreground">{hours}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note d'implémentation */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Note d'implémentation:</strong> Cette carte utiliserait react-leaflet 
            avec des marqueurs interactifs et une vraie intégration Google Maps/OpenStreetMap.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
