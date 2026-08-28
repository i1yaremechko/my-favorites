export const formatCommentDate = (iso: string, language: string): string => {
  return new Intl.DateTimeFormat(language === 'uk' ? 'uk-UA' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};
