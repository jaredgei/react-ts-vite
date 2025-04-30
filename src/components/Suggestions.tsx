import 'scss/Suggestions.scss';
import { MouseEvent, ReactNode } from 'react';

type Suggestion = {
  name?: string,
  onSelect?: () => void,
  uri?: string,
  icon?: React.ReactNode
};

type Props = {
  content?: ReactNode
  suggestions: Suggestion[],
  filter?: string
};

const Suggestions = ({ content, suggestions, filter }: Props) => {
  const onSuggestionClick = (event: MouseEvent<HTMLDivElement>, suggestion: Suggestion) => {
    if (!suggestion.onSelect) return;
    event.preventDefault();
    event.stopPropagation();
    suggestion.onSelect();
  };

  // filter out suggestions based on what's been inputted
  const filteredSuggestions = (suggestions || []).filter(suggestion => !filter || suggestion.name?.toLowerCase().indexOf(filter.toLowerCase()) !== -1);
  return (
    <div className='suggestions'>
      {content}
      {filteredSuggestions.map((suggestion, index) => {
        if (!suggestion.name) return <div key={index} className='divider' />;
        if (suggestion.uri) return (
          <a
            href={suggestion.uri}
            key={suggestion.name + index}
            className='suggestion'>
            {suggestion.name}
            {suggestion.icon}
          </a>
        );
        return (
          <div
            className='suggestion'
            key={suggestion.name + index}
            onClick={(event: MouseEvent<HTMLDivElement>) => onSuggestionClick(event, suggestion)}>
            {suggestion.name}
            {suggestion.icon}
          </div>
        );
      })}
    </div>
  );
};

export default Suggestions;
