import extend from 'extend';
import KEYS from '../../../constants/keys';
import * as zoom from '../../../utils/math/zoom';
import pinch from '../pinch';

describe('pinch', () => {
  let sandbox;
  let chart;
  let actions;
  let viewHandler;
  let pinchObject;
  let e;
  let myDataView;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    viewHandler = { getDataView: sandbox.stub() };
    actions = { zoom: { enabled: sandbox.stub() } };
    chart = { componentsFromPoint: sandbox.stub() };
    sandbox.stub(KEYS, 'COMPONENT').value({ POINT: 'point-component' });
    sandbox.stub(zoom, 'default');
    pinchObject = pinch({ chart, actions, viewHandler });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should have correct attributes ', () => {
    expect(pinchObject).to.have.all.keys(['type', 'key', 'options', 'events']);
  });

  describe('options', () => {
    it('should have correct attributes', () => {
      expect(pinchObject.options).to.have.all.keys(['event', 'pointers', 'threshold', 'enable']);
    });

    describe('enable', () => {
      it('should return true if e is not defined', () => {
        expect(pinchObject.options.enable('', undefined)).to.equal(true);
      });

      it('should return false if actions zoom is not enabled', () => {
        actions.zoom.enabled.returns(false);
        expect(pinchObject.options.enable('', 'e')).to.equal(false);
      });

      it('should return correct pointAreaPinched', () => {
        actions.zoom.enabled.returns(true);
        chart.componentsFromPoint
          .withArgs({ x: 200, y: 100 })
          .returns([{ key: 'point-component' }, { key: 'point-component', id: 'should-not-return-this' }]);
        expect(pinchObject.options.enable('', { center: { x: 200, y: 100 } })).to.deep.equal({
          key: 'point-component',
        });
      });
    });
  });

  describe('events', () => {
    it('should have correct attributes', () => {
      expect(pinchObject.events).to.have.all.keys(['zoomstart', 'zoommove', 'zoomend', 'zoomcancel']);
    });

    describe('zoommove', () => {
      describe('pan', () => {
        it('should modify myDataView correctly', () => {
          e = { preventDefault: sandbox.stub(), deltaX: 10, deltaY: 20, scale: 1 };
          pinchObject.events.zoom = {
            componentSize: { width: 100, height: 200 },
            xAxisMin: -1000,
            xAxisMax: 1000,
            yAxisMin: 0,
            yAxisMax: 2000,
          };
          myDataView = {};
          viewHandler.setDataView = (dataView) => {
            extend(true, myDataView, dataView);
          };
          pinchObject.events.zoommove(e);
          expect(myDataView).to.deep.equal({ xAxisMin: -1200, xAxisMax: 800, yAxisMin: 200, yAxisMax: 2200 });
        });
      });

      describe('pinch zoom', () => {
        it('should not call zoom when scale diff is smalller than 0.01', () => {
          pinchObject.events.pointArea = { rect: { width: 1, height: 2 } };
          e = { preventDefault: sandbox.stub(), scale: 0.792 };
          pinchObject.events.zoomstart(e);
          e = { preventDefault: sandbox.stub(), scale: 0.791 };
          pinchObject.events.zoommove(e);
          expect(zoom.default).not.to.have.been.called;
        });

        it('should call zoom when scale diff is larger than 0.01', () => {
          pinchObject.events.pointArea = { rect: { width: 1, height: 2 } };
          e = { preventDefault: sandbox.stub(), scale: 1.21 };
          pinchObject.events.zoomstart(e);
          e = { preventDefault: sandbox.stub(), scale: 1.23 };
          pinchObject.events.zoommove(e);
          expect(zoom.default).to.have.been.calledOnce;
        });
      });
    });
  });
});
