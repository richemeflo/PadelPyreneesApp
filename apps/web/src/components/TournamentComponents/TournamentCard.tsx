import * as React from 'react';
import { Calendar, MapPin, Users, Trophy, Clock, Euro, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tournament } from '../../types/tournament';

interface TournamentCardProps {
  tournament: Tournament;
  onViewDetails: (tournament: Tournament) => void;
  onRegister?: (tournament: Tournament) => void;
}

export function TournamentCard({ tournament, onViewDetails, onRegister }: TournamentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration':
        return <Badge variant="default" className="bg-green-500">Inscriptions ouvertes</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">À venir</Badge>;
      case 'ongoing':
        return (
          <Badge variant="destructive">
            <Hourglass className="h-4 w-4" />
          </Badge>
        );
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'débutant':
        return 'bg-green-100 text-green-800';
      case 'intermédiaire':
        return 'bg-blue-100 text-blue-800';
      case 'avancé':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'singles':
        return '👤';
      case 'doubles':
        return '👥';
      case 'mixed':
        return '👫';
      default:
        return '🎾';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const participationRate = (tournament.currentParticipants / tournament.maxParticipants) * 100;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
          onClick={() => onViewDetails(tournament)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge(tournament.status)}
          <Badge className={getLevelColor(tournament.level)}>
            {tournament.level}
          </Badge>
        </div>
        
        <div className="aspect-video w-full bg-muted rounded-md overflow-hidden mb-3">
          <img 
            src={tournament.image} 
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="space-y-2">
          <h3 className="line-clamp-2 group-hover:text-primary transition-colors">
            {getTypeIcon(tournament.type)} {tournament.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Informations principales */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(tournament.startDate)}</span>
            {tournament.startDate !== tournament.endDate && (
              <span>- {formatDate(tournament.endDate)}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{tournament.location.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{tournament.currentParticipants}/{tournament.maxParticipants} participants</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <span>{tournament.entryFee}€</span>
          </div>
        </div>

        {/* Barre de progression des inscriptions */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Inscriptions</span>
            <span>{Math.round(participationRate)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>

        {/* Prix principal */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Trophy className="h-4 w-4" />
          <span className="truncate">{tournament.prizes.first}</span>
        </div>

        {/* Date limite d'inscription */}
        {tournament.status === 'registration' && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Clock className="h-4 w-4" />
            <span>Limite: {formatDate(tournament.registrationDeadline)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onViewDetails(tournament);
            }}
          >
            Détails
          </Button>
          
          {tournament.status === 'registration' && onRegister && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onRegister(tournament);
              }}
            >
              S'inscrire
            </Button>
          )}
          
          {tournament.status === 'completed' && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewDetails(tournament);
              }}
            >
              Résultats
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}