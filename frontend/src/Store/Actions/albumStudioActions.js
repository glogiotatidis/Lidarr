import _ from 'lodash';
import $ from 'jquery';
import { createAction } from 'redux-actions';
import getMonitoringOptions from 'Utilities/Artist/getMonitoringOptions';
import { filterBuilderTypes, filterBuilderValueTypes, sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetClientSideCollectionFilterReducer from './Creators/Reducers/createSetClientSideCollectionFilterReducer';
import createHandleActions from './Creators/createHandleActions';
import { set } from './baseActions';
import { fetchAlbums } from './albumActions';
import { fetchArtist, filters, filterPredicates } from './artistActions';

//
// Variables

export const section = 'albumStudio';

//
// State

export const defaultState = {
  isSaving: false,
  saveError: null,
  sortKey: 'sortName',
  sortDirection: sortDirections.ASCENDING,
  secondarySortKey: 'sortName',
  secondarySortDirection: sortDirections.ASCENDING,
  selectedFilterKey: 'all',
  filters,
  filterPredicates,

  filterBuilderProps: [
    {
      name: 'monitored',
      label: 'Monitored',
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL
    },
    {
      name: 'status',
      label: 'Status',
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.ARTIST_STATUS
    },
    {
      name: 'artistType',
      label: 'Artist Type',
      type: filterBuilderTypes.EXACT
    },
    {
      name: 'qualityProfileId',
      label: 'Quality Profile',
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE
    },
    {
      name: 'languageProfileId',
      label: 'Language Profile',
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.LANGUAGE_PROFILE
    },
    {
      name: 'metadataProfileId',
      label: 'Metadata Profile',
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.METADATA_PROFILE
    },
    {
      name: 'rootFolderPath',
      label: 'Root Folder Path',
      type: filterBuilderTypes.EXACT
    },
    {
      name: 'tags',
      label: 'Tags',
      type: filterBuilderTypes.ARRAY,
      valueType: filterBuilderValueTypes.TAG
    }
  ]
};

export const persistState = [
  'albumStudio.sortKey',
  'albumStudio.sortDirection',
  'albumStudio.selectedFilterKey',
  'albumStudio.customFilters'
];

//
// Actions Types

export const SET_ALBUM_STUDIO_SORT = 'albumStudio/setAlbumStudioSort';
export const SET_ALBUM_STUDIO_FILTER = 'albumStudio/setAlbumStudioFilter';
export const SAVE_ALBUM_STUDIO = 'albumStudio/saveAlbumStudio';

//
// Action Creators

export const setAlbumStudioSort = createAction(SET_ALBUM_STUDIO_SORT);
export const setAlbumStudioFilter = createAction(SET_ALBUM_STUDIO_FILTER);
export const saveAlbumStudio = createThunk(SAVE_ALBUM_STUDIO);

//
// Action Handlers

export const actionHandlers = handleThunks({

  [SAVE_ALBUM_STUDIO]: function(getState, payload, dispatch) {
    const {
      artistIds,
      monitored,
      monitor
    } = payload;

    let monitoringOptions = null;
    const artist = [];
    const allArtists = getState().artist.items;

    artistIds.forEach((id) => {
      const s = _.find(allArtists, { id });
      const artistToUpdate = { id };

      if (payload.hasOwnProperty('monitored')) {
        artistToUpdate.monitored = monitored;
      }

      if (monitor) {
        const {
          albums,
          options: artistMonitoringOptions
        } = getMonitoringOptions(monitor);

        if (!monitoringOptions) {
          monitoringOptions = artistMonitoringOptions;
        }

        artistToUpdate.albums = albums;
      }

      artist.push(artistToUpdate);
    });

    dispatch(set({
      section,
      isSaving: true
    }));

    const promise = $.ajax({
      url: '/albumStudio',
      method: 'POST',
      data: JSON.stringify({
        artist,
        monitoringOptions
      }),
      dataType: 'json'
    });

    promise.done((data) => {
      dispatch(fetchAlbums());

      dispatch(set({
        section,
        isSaving: false,
        saveError: null
      }));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isSaving: false,
        saveError: xhr
      }));
    });
  }
});

//
// Reducers

export const reducers = createHandleActions({

  [SET_ALBUM_STUDIO_SORT]: createSetClientSideCollectionSortReducer(section),
  [SET_ALBUM_STUDIO_FILTER]: createSetClientSideCollectionFilterReducer(section)

}, defaultState, section);

