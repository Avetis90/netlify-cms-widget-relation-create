import Control from './Control'
import Preview from './Preview'

if (typeof window !== 'undefined') {
  window.RelationCreateControl = Control
  window.RelationCreatePreview = Preview
}

export { Control, Preview }
