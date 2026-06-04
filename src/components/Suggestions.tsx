import 'scss/Suggestions.scss';
import { MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Suggestion = {
  name?: string;
  onSelect?: () => void;
  uri?: string;
  icon?: React.ReactNode;
};

type Props = {
  content?: ReactNode;
  suggestions: Suggestion[];
  filter?: string;
};

const Suggestions = ({ content, suggestions, filter }: Props) => {
  const onSuggestionClick = (event: MouseEvent<HTMLButtonElement>, suggestion: Suggestion) => {
    if (!suggestion.onSelect) return;
    event.preventDefault();
    event.stopPropagation();
    suggestion.onSelect();
  };

  // filter out suggestions based on what's been inputted
  const filteredSuggestions = (suggestions || []).filter(
    (suggestion) => !filter || suggestion.name?.toLowerCase().indexOf(filter.toLowerCase()) !== -1,
  );
  return (
    <div className='suggestions'>
      {content}
      {filteredSuggestions.map((suggestion, index) => {
        if (!suggestion.name) return <div key={index} className='divider' />;
        if (suggestion.uri)
          return (
            <Link to={suggestion.uri} key={suggestion.name + index} className='suggestion'>
              {suggestion.name}
              {suggestion.icon}
            </Link>
          );
        return (
          <button
            type='button'
            className='suggestion'
            key={suggestion.name + index}
            onClick={(event: MouseEvent<HTMLButtonElement>) => onSuggestionClick(event, suggestion)}>
            {suggestion.name}
            {suggestion.icon}
          </button>
        );
      })}
    </div>
  );
};

export default Suggestions;
