/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';

import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;

import connectHits from '../connectHits.js';

const fakeClient = {addAlgoliaAgent: () => {}};

describe('connectHits', () => {
  it('Renders during init and render', () => {
    const container = document.createElement('div');
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({
      container,
      hitsPerPage: 10,
    });

    const config = widget.getConfiguration();
    expect(config).toEqual({hitsPerPage: 10});

    // test if widget is not rendered yet at this point
    expect(rendering.callCount).toBe(0);

    const helper = jsHelper(fakeClient, '', config);
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering.callCount).toBe(1);
    // test if isFirstRendering is true during init
    expect(rendering.lastCall.args[1]).toBe(true);

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.containerNode).toBe(container);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering.callCount).toBe(2);
    expect(rendering.lastCall.args[1]).toBe(false);

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.containerNode).toBe(container);
  });

  it('Provides the hits and the whole results', () => {
    const container = document.createElement('div');
    const rendering = sinon.stub();
    const makeWidget = connectHits(rendering);
    const widget = makeWidget({
      container,
    });

    const helper = jsHelper(fakeClient, '', {});
    helper.search = sinon.stub();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
      onHistoryChange: () => {},
    });

    const firstRenderingOptions = rendering.lastCall.args[0];
    expect(firstRenderingOptions.hits).toEqual([]);
    expect(firstRenderingOptions.results).toBe(undefined);

    const hits = [
      {fake: 'data'},
      {sample: 'infos'},
    ];
    const results = new SearchResults(helper.state, [{hits}]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.lastCall.args[0];
    expect(secondRenderingOptions.hits).toEqual(hits);
    expect(secondRenderingOptions.results).toEqual(results);
  });
});