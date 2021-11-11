import RelationCreateControl from './Control';
import RelationCreatePreview from './Preview';

if (typeof window !== 'undefined') {
  window.RelationCreateControl = RelationCreateControl;
  window.RelationCreatePreview = RelationCreatePreview;
}
const exportObject = { RelationCreateControl, RelationCreatePreview };

export default exportObject;
