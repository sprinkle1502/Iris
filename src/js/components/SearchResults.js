import React from 'react';
import { connect } from 'react-redux';
import { sortItems } from '../util/arrays';
import URILink from './URILink';
import Icon from './Icon';
import TrackList from './TrackList';
import { Grid } from './Grid';
import { I18n } from '../locale';
import Button from './Button';
import { makeSearchResultsSelector, getSortSelector } from '../util/selectors';

const SearchResults = ({
  type,
  query,
  sortField,
  sortReverse: sortReverseProp,
  uri_schemes_priority,
  all,
  results: rawResults,
}) => {
  const encodedTerm = encodeURIComponent(query.term);
  let results = rawResults;
  let sortReverse = sortReverseProp;

  if (!results) return null;

  let sort_map = null;
  switch (sortField) {
    case 'uri':
      sort_map = uri_schemes_priority;
      break;
    case 'followers':
      // Followers (aka popularlity works in reverse-numerical order)
      // Ie "more popular" is a bigger number
      sortReverse = !sortReverse;
      break;
    default:
      break;
  }

  results = sortItems(
    results,
    (type === 'tracks' && sortField === 'followers' ? 'popularity' : sortField),
    sortReverse,
    sort_map,
  );

  const resultsCount = results.length;
  if (all && type !== 'tracks' && results.length > 5) {
    results = results.slice(0, 6);
  }

  if (results.length <= 0) return null;

  return (
    <div>
      <h4>
        {!all && (
          <span>
            <URILink uri={`iris:search:all:${encodedTerm}`} uriType="search" unencoded>
              <I18n path="search.title" />
            </URILink>
            {' '}
            <Icon type="fontawesome" name="angle-right" />
            {' '}
            <I18n path={`search.${type}.title`} />
          </span>
        )}
        {all && (
          <URILink uri={`iris:search:${type}:${encodedTerm}`} uriType="search" unencoded>
            <I18n path={`search.${type}.title`} />
          </URILink>
        )}
      </h4>
      <section className="grid-wrapper">
        {type === 'artists' && <Grid items={results} show_source_icon mini={all} />}
        {type === 'albums' && <Grid items={results} show_source_icon mini={all} />}
        {type === 'playlists' && <Grid items={results} show_source_icon mini={all} />}
        {type === 'tracks' && <TrackList tracks={results} uri={`iris:search:${query.type}:${encodedTerm}`} show_source_icon />}
        {/* <LazyLoadListener enabled={this.props.artists_more && spotify_search_enabled} loadMore={loadMore} /> */}

        {resultsCount > results.length && (
          <Button uri={`iris:search:${type}:${encodedTerm}`} uriType="search" unencoded>
            <I18n path={`search.${type}.more`} count={resultsCount} />
          </Button>
        )}
      </section>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const {
    query: {
      term,
    },
    type,
  } = ownProps;
  const {
    ui: {
      uri_schemes_priority = [],
    },
  } = state;
  const searchResultsSelector = makeSearchResultsSelector(term, type);
  const { sortField, sortReverse } = getSortSelector(state, 'search_results');

  return {
    results: searchResultsSelector(state),
    uri_schemes_priority,
    sortField,
    sortReverse,
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SearchResults);
