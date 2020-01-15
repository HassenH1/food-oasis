import { useReducer, useEffect } from 'react';
import * as stakeholderService from '../../services/stakeholder-service';
import * as categoryService from '../../services/category-service';
import { actionTypes } from './actionTypes';
import { reducer } from './reducer';
import { initialState } from './initialState';
import queryString from 'query-string';

export function useStakeholders(history) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const search = async (
    searchString,
    latitude,
    longitude,
    selectedLocationName,
    selectedCategories,
    selectedDistance,
  ) => {
    const {
      FETCH_FAILURE,
      FETCH_REQUEST,
      FETCH_SUCCESS,
    } = actionTypes.STAKEHOLDERS;
    if (!selectedCategories) return;
    try {
      dispatch({ type: FETCH_REQUEST });
      const stakeholders = await stakeholderService.search({
        name: searchString,
        categoryIds: selectedCategories.map((category) => category.id),
        latitude,
        longitude,
        distance: selectedDistance,
      });
      dispatch({
        type: FETCH_SUCCESS,
        stakeholders,
        payload: {
          searchString,
          selectedLatitude: latitude,
          selectedLongitude: longitude,
          selectedLocationName,
          selectedCategories,
          selectedDistance,
        },
      });
      history.push(
        `/stakeholders?name=${searchString}` +
          `&radius=${selectedDistance}` +
          `&lat=${latitude}` +
          `&lon=${longitude}` +
          `&placeName=${selectedLocationName}` +
          `&categoryIds=${selectedCategories.map((c) => c.id).join(',')}`,
      );
    } catch (err) {
      console.log(err);
      dispatch({ type: FETCH_FAILURE });
    }
  };

  const fetchCategories = async () => {
    const {
      FETCH_FAILURE,
      FETCH_REQUEST,
      FETCH_SUCCESS,
    } = actionTypes.CATEGORIES;

    dispatch({ type: FETCH_REQUEST });
    try {
      const allCategories = await categoryService.getAll();
      const categories = allCategories.filter((category) => !category.inactive);

      const selectedCategories = categories.filter(
        (category) =>
          category.id === 1 || category.id === 8 || category.id === 9,
      ); // setting the initial selection to FoodPantry, Food Bank, Soup Kitchen
      dispatch({ type: FETCH_SUCCESS, categories, selectedCategories });
      return categories;
    } catch (error) {
      dispatch({ type: FETCH_FAILURE, error });
    }
  };

  const fetchLocation = () => {
    const {
      FETCH_FAILURE,
      FETCH_REQUEST,
      FETCH_SUCCESS,
    } = actionTypes.LOCATION;

    let userCoordinates = { latitude: null, longitude: null };

    dispatch({ type: FETCH_REQUEST });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!position) {
            dispatch({
              type: FETCH_SUCCESS,
              userCoordinates: { latitude: null, longitude: null },
            });
          }
          const userCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          dispatch({ type: FETCH_SUCCESS, userCoordinates });
        },
        (error) => {
          dispatch({ type: FETCH_FAILURE, error });
        },
      );
    } else {
      // If browser location permission is denied, the request is
      // "successful", but the result is null coordinates.
      dispatch({
        type: FETCH_SUCCESS,
        userCoordinates,
      });
    }
    console.warn('userCoordinates', userCoordinates);
    return userCoordinates;
  };

  const applyQueryStringParameters = (history, initialState) => {
    // The goal here is to overwrite the initialState with
    // search criteria from the query string parameters, if
    // supplied. The effect should only run once when the
    // this hook loads, after the list of categories has loaded.
    let {
      searchString,
      selectedLatitude,
      selectedLongitude,
      selectedLocationName,
      selectedDistance,
      selectedCategoryIds,
    } = initialState;

    const params = queryString.parse(history.location.search);

    // override initial search parameters with any
    // query string parameters
    searchString = params.name || searchString;
    selectedDistance = params.radius || selectedDistance;
    selectedLatitude = Number.parseFloat(params.lat) || selectedLatitude;
    selectedLongitude = Number.parseFloat(params.lon) || selectedLongitude;
    selectedLocationName = params.placeName ? decodeURI(params.placeName) : '';
    if (params.categoryIds) {
      selectedCategoryIds = params.categoryIds.split(',');
    }

    dispatch({
      type: actionTypes.INITIALIZE_STATE,
      payload: {
        searchString,
        selectedLatitude: selectedLatitude,
        selectedLongitude: selectedLongitude,
        selectedLocationName,
        selectedCategoryIds,
        selectedDistance,
        queryParametersLoaded: true,
      },
    });
  };

  useEffect(() => {
    // Runs once on initialization to get list of all active categories
    fetchCategories();

    // Runs once on initialization to get user's browser lat/lon, if
    // browser permits
    fetchLocation();
  }, []);

  useEffect(() => {
    applyQueryStringParameters(history, initialState);
  }, [history]);

  useEffect(() => {
    // if we don't have the categories fetched yet, bail
    if (!state.categories) return;

    // If the query string parameters have not been applie, bail
    if (!state.queryParametersLoaded) return;

    let {
      searchString,
      selectedLatitude,
      selectedLongitude,
      selectedLocationName,
      selectedDistance,
      selectedCategoryIds,
    } = state;

    let selectedCategories = selectedCategoryIds.map(
      (id) => state.categories.filter((cat) => cat.id === Number(id))[0],
    );

    search(
      searchString,
      selectedLatitude,
      selectedLongitude,
      selectedLocationName,
      selectedCategories,
      selectedDistance,
    );
  }, [state.categories, state.queryParametersLoaded, initialState]);

  return { state, dispatch, actionTypes, search };
}
