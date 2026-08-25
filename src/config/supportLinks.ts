export interface SupportLink {
  id: string;
  labelKey: 'supportPrivatLabel';
  descriptionKey: 'supportPrivatDesc';
  url: string;
}

export const SUPPORT_LINKS: SupportLink[] = [
  {
    id: 'privatbank',
    labelKey: 'supportPrivatLabel',
    descriptionKey: 'supportPrivatDesc',
    url: 'https://www.privat24.ua/send/4t8q2',
  },
];
