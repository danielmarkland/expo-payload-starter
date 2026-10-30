// Narrow presentation patch for the pinned Payload 3.90.2 client bundle.
// Retains native permission checks, routes, upload callbacks and React state.
module.exports = function payloadListActions(source) {
  const changes = [
    [
      'buttonStyle:"pill",className:`${QQ}__create-new-button`,el:"link",size:"small",to:r,children:i("general:createNew")',
      'buttonStyle:"primary",className:`${QQ}__create-new-button`,el:"link",size:"medium",icon:"plus",to:r,children:s.language==="en"?"New "+qQ(l,s):i("general:createNewLabel",{label:qQ(l,s)})',
    ],
    [
      '"aria-label":i("general:createNewLabel",{label:qQ(l,s)})',
      '"aria-label":s.language==="en"?"New "+qQ(l,s):i("general:createNewLabel",{label:qQ(l,s)})',
    ],
    [
      'buttonStyle:"pill",onClick:g,size:"small",children:f("upload:bulkUpload")',
      'buttonStyle:"secondary",onClick:g,size:"medium",children:f("upload:bulkUpload")',
    ],
  ]
  for (const [before, after] of changes) {
    if (source.split(before).length !== 2) {
      throw new Error(
        'Payload list action integration changed. Review the pinned UI bundle before upgrading.',
      )
    }
    source = source.replace(before, after)
  }
  return source
}
