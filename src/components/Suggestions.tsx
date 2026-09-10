import styles from 'scss/Suggestions.module.scss';
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

  const filteredSuggestions = (suggestions || []).filter(
    (suggestion) => !filter || suggestion.name?.toLowerCase().indexOf(filter.toLowerCase()) !== -1,
  );
  return (
    <div className={styles.suggestions}>
      {content}
      {filteredSuggestions.map((suggestion, index) => {
        if (!suggestion.name) return <div key={`divider-${index}`} className={styles.divider} />;
        if (suggestion.uri)
          return (
            <Link to={suggestion.uri} key={suggestion.name + index} className={styles.suggestion}>
              {suggestion.name}
              {suggestion.icon}
            </Link>
          );
        return (
          <button
            type='button'
            className={styles.suggestion}
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
