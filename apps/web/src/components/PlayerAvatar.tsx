import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ComponentProps } from 'react';

interface PlayerAvatarProps extends ComponentProps<typeof Avatar> {
  src?: string;
  alt: string;
  name: string;
}

export function PlayerAvatar({ src, alt, name, ...props }: PlayerAvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
