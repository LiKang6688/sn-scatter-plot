import MODES from '../../../constants/modes';
import KEYS from '../../../constants/keys';
import createLines from './lines';
import createLabels from './labels';

export default function createReferenceLines({ models, context }) {
  const { layoutModel, dockModel, themeModel } = models;
  const { rtl, localeInfo } = context;
  const style = themeModel.query.getStyle();

  return [
    createLines({
      layoutModel,
      scale: KEYS.SCALE.X,
      key: KEYS.COMPONENT.REFERENCE_LINES_X,
      minimumLayoutMode: MODES.REFERENCE_LINE,
    }),
    createLines({
      layoutModel,
      scale: KEYS.SCALE.Y,
      key: KEYS.COMPONENT.REFERENCE_LINES_Y,
      minimumLayoutMode: MODES.REFERENCE_LINE,
    }),
    createLabels({
      layoutModel,
      scale: KEYS.SCALE.X,
      key: KEYS.COMPONENT.REFERENCE_LINE_LABELS_X,
      dock: dockModel.x.opposite,
      rtl,
      style,
      localeInfo,
    }),
    createLabels({
      layoutModel,
      scale: KEYS.SCALE.Y,
      key: KEYS.COMPONENT.REFERENCE_LINE_LABELS_Y,
      dock: dockModel.y.opposite,
      rtl,
      style,
      localeInfo,
    }),
  ];
}
