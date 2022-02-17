// eslint-disable-next-line no-unused-vars
import * as stardust from '@nebula.js/stardust';
import * as createPicassoDefinition from '../../picasso-definition';
import * as getLogicalSize from '../../logical-size';
import * as viewStateActions from '../view-state';
import customTooltipMigrators from '../../custom-tooltip/migrators';
import useSettings from '../use-settings';

describe('use-settings', () => {
  let sandbox;
  let create;
  let core;
  let models;
  let flags;
  let rect;
  let settings;
  let setSettings;
  let model;
  let theme;
  let options;
  let constraints;
  let translator;
  let selections;
  let fn;
  let conditionArray;
  let layoutService;
  let chartModel;
  let colorService;
  let pluginService;
  let propertiesModel;
  let dataHandler;
  let dockService;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rect = { width: 100, height: 200 };
    settings = 'stngs';
    setSettings = sandbox.stub();
    model = 'enigma-model';
    theme = 'theme';
    options = { viewState: undefined };
    constraints = 300;
    translator = 'translator';
    selections = 'selections';
    dataHandler = { fetch: sandbox.stub().resolves() };
    layoutService = { getLayout: sandbox.stub() };
    chartModel = {
      query: {
        getDataHandler: sandbox.stub().returns(dataHandler),
        getMeta: sandbox.stub().returns({ previousConstraints: undefined }),
      },
      command: { layoutComponents: sandbox.stub(), setMeta: sandbox.stub() },
    };
    pluginService = { initialize: sandbox.stub().resolves() };
    propertiesModel = { command: { initialize: sandbox.stub().resolves() } };
    colorService = {
      initialize: sandbox.stub().resolves(),
      custom: { updateBrushAliases: sandbox.stub(), updateLegend: sandbox.stub() },
      isInitialized: sandbox.stub().returns(true),
    };
    models = { layoutService, chartModel, colorService, pluginService, propertiesModel, dockService };
    core = { viewState: undefined };
    dockService = { update: sandbox.stub() };
    sandbox.stub(stardust, 'useRect').returns(rect);
    sandbox.stub(stardust, 'useState').returns([settings, setSettings]);
    sandbox.stub(stardust, 'useModel').returns(model);
    sandbox.stub(stardust, 'useTheme').returns(theme);
    sandbox.stub(stardust, 'useOptions').returns(options);
    sandbox.stub(stardust, 'useConstraints').returns(constraints);
    sandbox.stub(stardust, 'useTranslator').returns(translator);
    sandbox.stub(stardust, 'useSelections').returns(selections);
    sandbox.stub(createPicassoDefinition, 'default').returns('new-settings');
    sandbox.stub(stardust, 'usePromise');
    sandbox.stub(stardust, 'useEffect');
    sandbox.stub(getLogicalSize, 'default');
    sandbox.stub(viewStateActions, 'initializeViewState');
    sandbox.stub(viewStateActions, 'updateViewState');
    sandbox.stub(customTooltipMigrators.attrExpr, 'updateProperties');
    create = () => useSettings({ core, models, flags });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('usePromise', () => {
    it('should have the second argument being an array with only one element: models', () => {
      create();
      conditionArray = stardust.usePromise.getCall(0).args[1];
      expect(conditionArray).to.deep.equal([models]);
    });

    describe('the function in the arugment list', () => {
      it('should resolve to nothing (undefined) when models are not defined', async () => {
        models = undefined;
        create();
        fn = stardust.usePromise.getCall(0).args[0];
        const result = await fn();
        expect(result).to.equal(undefined);
      });

      it('should call setSettings with the new settings, case 1: data fetching resolved ', async () => {
        create();
        fn = stardust.usePromise.getCall(0).args[0];
        await fn();
        expect(setSettings).to.have.been.calledWithExactly('new-settings');
      });

      it('should call setSettings with the new settings, case 2: data fetching rejected ', async () => {
        dataHandler = { fetch: sandbox.stub().rejects() };
        chartModel.query.getDataHandler.returns(dataHandler);
        create();
        fn = stardust.usePromise.getCall(0).args[0];
        await fn();
        expect(setSettings).to.have.been.calledWithExactly('new-settings');
      });
    });
  });

  describe('useEffect 1', () => {
    it('should have the second argument being an array with correct elements', () => {
      create();
      conditionArray = stardust.useEffect.getCall(0).args[1];
      expect(conditionArray).to.deep.equal([100, 200]);
    });

    describe('the function in the arugment list', () => {
      beforeEach(() => {
        create();
        fn = stardust.useEffect.getCall(0).args[0];
      });

      it('should resolve to nothing (undefined) when models are not defined', () => {
        models = undefined;
        const result = fn();
        expect(result).to.equal(undefined);
      });

      it('should resolve to nothing (undefined) when colorService are not initialized', () => {
        colorService.isInitialized.returns(false);
        const result = fn();
        expect(result).to.equal(undefined);
      });

      it('should call chartModel setMeta correctly, case 1: normal resize', () => {
        stardust.useConstraints.returns({});
        chartModel.query.getMeta.returns({ previousConstraints: {} });
        create();
        fn = stardust.useEffect.getCall(2).args[0];
        fn();
        expect(chartModel.command.setMeta.firstCall).to.have.been.calledWithExactly({ constraintsHaveChanged: false });
        expect(chartModel.command.setMeta.secondCall).to.have.been.calledWithExactly({ previousConstraints: {} });
      });

      it('should call chartModel setMeta correctly, case 2: resize accompanied by constraints changed', () => {
        stardust.useConstraints.returns({});
        chartModel.query.getMeta.returns({ previousConstraints: { active: false } });
        create();
        fn = stardust.useEffect.getCall(2).args[0];
        fn();
        expect(chartModel.command.setMeta.firstCall).to.have.been.calledWithExactly({ constraintsHaveChanged: true });
        expect(chartModel.command.setMeta.secondCall).to.have.been.calledWithExactly({
          previousConstraints: {},
        });
      });

      it('should call setSettings with the new settings ', () => {
        fn();
        expect(setSettings).to.have.been.calledWithExactly('new-settings');
      });
    });
  });

  describe('useEffect 2', () => {
    it('should have the second argument being an array with correct elements', () => {
      create();
      conditionArray = stardust.useEffect.getCall(1).args[1];
      expect(conditionArray).to.deep.equal([300]);
    });

    describe('the function in the arugment list', () => {
      beforeEach(() => {
        create();
        fn = stardust.useEffect.getCall(1).args[0];
      });

      it('should resolve to nothing (undefined) when models are not defined', () => {
        models = undefined;
        const result = fn();
        expect(result).to.equal(undefined);
      });

      it('should resolve to nothing (undefined) when colorService are not initialized', () => {
        colorService.isInitialized.returns(false);
        const result = fn();
        expect(result).to.equal(undefined);
      });

      it('should call setSettings with the new settings ', () => {
        fn();
        expect(setSettings).to.have.been.calledWithExactly('new-settings');
      });
    });
  });
});
