import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, Trophy, Euro, Clock, Hourglass, Share2, UserPlus, Download, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Tournament, TournamentLevel, TournamentStatus, TournamentType } from '../../types/tournament';
import { TournamentBracket } from './TournamentBracket';
import { sampleBracket } from '../../data/tournamentData';

interface TournamentDetailProps {
  tournament: Tournament;
  onBack: () => void;
  onRegister?: (tournament: Tournament) => void;
}

export function TournamentDetail({ tournament, onBack, onRegister }: TournamentDetailProps) {
  const { t, i18n } = useTranslation();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'fr-FR';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusLabel = (status: TournamentStatus) => {
    switch (status) {
      case 'registration':
        return t('tournamentsPage.status.registration');
      case 'upcoming':
        return t('tournamentsPage.status.upcoming');
      case 'ongoing':
        return t('tournamentsPage.status.ongoing');
      case 'completed':
        return t('tournamentsPage.status.completed');
      default:
        return status;
    }
  };

  const getTypeLabel = (type: TournamentType) => {
    switch (type) {
      case 'singles':
        return t('tournamentsPage.types.singles');
      case 'doubles':
        return t('tournamentsPage.types.doubles');
      case 'mixed':
        return t('tournamentsPage.types.mixed');
      case 'all':
        return t('tournamentsPage.types.all');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: TournamentType) => {
    switch (type) {
      case 'singles':
        return '🎯';
      case 'doubles':
        return '🏓';
      case 'mixed':
        return '👥';
      default:
        return '🎾';
    }
  };

  const getTypeDisplay = (type: TournamentType) => {
    return `${getTypeIcon(type)} ${getTypeLabel(type)}`;
  };

  const getLevelLabel = (level: TournamentLevel) => {
    switch (level) {
      case 'débutant':
        return t('tournamentsPage.levels.beginner');
      case 'intermédiaire':
        return t('tournamentsPage.levels.intermediate');
      case 'avancé':
        return t('tournamentsPage.levels.advanced');
      case 'expert':
        return t('tournamentsPage.levels.expert');
      case 'all':
        return t('tournamentsPage.levels.all');
      default:
        return level;
    }
  };

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case 'registration':
        return <Badge className="bg-green-500">{getStatusLabel(status)}</Badge>;
      case 'upcoming':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {getStatusLabel(status)}
          </Badge>
        );
      case 'ongoing':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Hourglass className="h-4 w-4" />
            {getStatusLabel(status)}
          </Badge>
        );
      case 'completed':
        return <Badge variant="outline">{getStatusLabel(status)}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelColor = (level: TournamentLevel) => {
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

  const participationRate = (tournament.currentParticipants / tournament.maxParticipants) * 100;
  const spotsLeft = tournament.maxParticipants - tournament.currentParticipants;

  const handleShare = (method: string) => {
    const url = window.location.href;
    const text = t('tournamentsPage.share.text', { title: tournament.title });
    
    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success(t('tournamentsPage.actions.shareCopied'));
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(tournament.title)}&body=${encodeURIComponent(text + '\n\n' + url)}`);
        break;
    }
    setShareDialogOpen(false);
  };

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error(t('tournamentsPage.actions.inviteEmailRequired'));
      return;
    }
    
    // Simulation d'envoi d'invitation
    toast.success(t('tournamentsPage.actions.inviteSent', { email: inviteEmail }));
    setInviteEmail('');
    setInviteMessage('');
    setInviteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('tournamentsPage.actions.back')}
        </Button>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                {t('tournamentsPage.actions.share')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('tournamentsPage.actions.shareTitle')}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleShare('copy')} variant="outline">
                  {t('tournamentsPage.actions.shareCopy')}
                </Button>
                <Button onClick={() => handleShare('whatsapp')} variant="outline">
                  {t('tournamentsPage.actions.shareWhatsapp')}
                </Button>
                <Button onClick={() => handleShare('email')} variant="outline">
                  {t('tournamentsPage.actions.shareEmail')}
                </Button>
                <Button onClick={() => window.print()} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('tournamentsPage.actions.downloadPdf')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                {t('tournamentsPage.actions.invite')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('tournamentsPage.actions.inviteTitle')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder={t('tournamentsPage.actions.inviteEmailPlaceholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Textarea
                  placeholder={t('tournamentsPage.actions.inviteMessagePlaceholder')}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                />
                <Button onClick={handleInvite} className="w-full">
                  {t('tournamentsPage.actions.sendInvite')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Image et informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video w-full bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={tournament.image} 
                  alt={tournament.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {getStatusBadge(tournament.status)}
                  <Badge className={getLevelColor(tournament.level)}>
                    {getLevelLabel(tournament.level)}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeDisplay(tournament.type)}
                  </Badge>
                </div>
                
                <h1 className="mb-4">{tournament.title}</h1>
                <p className="text-muted-foreground mb-6">
                  {tournament.description}
                </p>

                {/* Informations organisateur */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="mb-2">{t('tournamentsPage.labels.organizer')}</h4>
                  <div className="space-y-1">
                    <p>{tournament.organizer.name}</p>
                    <p className="text-sm text-muted-foreground">{tournament.organizer.contact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec informations clés */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('tournamentsPage.labels.info')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">{t('tournamentsPage.labels.startDate')}</p>
                  <p>{formatDate(tournament.startDate)}</p>
                </div>
              </div>

              {tournament.startDate !== tournament.endDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">{t('tournamentsPage.labels.endDate')}</p>
                    <p>{formatDate(tournament.endDate)}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{t('tournamentsPage.labels.location')}</p>
                  <p>{tournament.location.name}</p>
                  <p className="text-sm text-muted-foreground">{tournament.location.address}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{t('tournamentsPage.labels.participants')}</p>
                  <div className="flex items-center justify-between">
                    <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                    <span className="text-sm text-muted-foreground">
                      {t('tournamentsPage.labels.spotsLeft', { count: spotsLeft })}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${participationRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">{t('tournamentsPage.labels.entryFee')}</p>
                  <p>{formatCurrency(tournament.entryFee)}</p>
                </div>
              </div>

              {tournament.status === 'registration' && (
                <>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm">{t('tournamentsPage.labels.deadline')}</p>
                      <p>{formatDate(tournament.registrationDeadline)}</p>
                    </div>
                  </div>

                  <Separator />

                  {onRegister && (
                    <Button 
                      className="w-full" 
                      onClick={() => onRegister(tournament)}
                      disabled={spotsLeft === 0}
                    >
                      {spotsLeft === 0
                        ? t('tournamentsPage.actions.full')
                        : t('tournamentsPage.actions.registerNow')}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Prix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {t('tournamentsPage.labels.prizes')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('tournamentsPage.labels.firstPlace')}</span>
                <span>{tournament.prizes.first}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('tournamentsPage.labels.secondPlace')}</span>
                <span>{tournament.prizes.second}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('tournamentsPage.labels.thirdPlace')}</span>
                <span>{tournament.prizes.third}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets pour contenu détaillé */}
      <Tabs defaultValue="location" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="location">{t('tournamentsPage.tabs.location')}</TabsTrigger>
          <TabsTrigger value="bracket">{t('tournamentsPage.tabs.bracket')}</TabsTrigger>
          <TabsTrigger value="results">{t('tournamentsPage.tabs.results')}</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('tournamentsPage.location.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p>{t('tournamentsPage.location.mapPlaceholder')}</p>
                  <p className="text-sm text-muted-foreground">
                    {tournament.location.name}<br />
                    {tournament.location.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('tournamentsPage.location.coordinates')}: {tournament.location.lat}, {tournament.location.lng}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          {tournament.status === 'completed' || tournament.status === 'ongoing' ? (
            <TournamentBracket bracket={sampleBracket} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="mb-2">{t('tournamentsPage.bracket.pendingTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('tournamentsPage.bracket.pendingSubtitle')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          {tournament.status === 'completed' && tournament.results ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  {t('tournamentsPage.resultsSection.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200">
                  <Trophy className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                  <h3 className="text-yellow-900 mb-2">{t('tournamentsPage.resultsSection.champion')}</h3>
                  <p>{tournament.results.winner.name}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="mb-2">{t('tournamentsPage.resultsSection.finalist')}</h4>
                    <p>{tournament.results.runnerUp.name}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h4 className="mb-2">{t('tournamentsPage.resultsSection.thirdPlace')}</h4>
                    <p>{tournament.results.thirdPlace[0].name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="mb-2">{t('tournamentsPage.resultsSection.pendingTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('tournamentsPage.resultsSection.pendingSubtitle')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
