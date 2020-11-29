import { AutoForm } from 'meteor/aldeed:autoform'

const before = doc => {
  // Append an `outputs` empty array to each step
  (doc.steps||[]).map(s => s.outputs = [])

  // Get trigger position details
  const tc = $('#flow-editor .flow-step-trigger')
  doc.trigger.x = parseInt(tc.css('left'), 10)
  doc.trigger.y = parseInt(tc.css('top'), 10)
  doc.trigger.outputs = []

  // Get steps position details
  const stepCards = $('#flow-editor .flow-step-step')
  stepCards.map((index, card) => {
    doc.steps[index].x = parseInt($(card).css('left'), 10)
    doc.steps[index].y = parseInt($(card).css('top'), 10)
  })

  let realPosition = (i) => {
    let offset = count = 0
    while(count < $(`.flow-step-step`).length) {
      if (!$(`.flow-step-step[data-step="${count}"]`).length) {
        offset++
      }
      count++
    }
    return (i - offset) > 0 ? (i - offset) : 0
  }

  // Get steps connection details
  jsPlumb.getConnections().map((connection, index) => {
    const source = $(`#${connection.sourceId}`)
    const target = $(`#${connection.targetId}`)

    const fromTrigger = source.attr('data-step') === 'trigger'
    const targetIndex = Number(target.attr('data-step'))
    const sourceIndex = Number(source.attr('data-step'))
    const sourceCondition = source.attr('data-condition')
    const realTarget = realPosition(targetIndex)
    const realSource = realPosition(sourceIndex)

    if (fromTrigger) {
      doc.trigger.outputs.push({
        // reason: 'step',
        stepIndex: realTarget
      })
    }
    else {
      doc.steps[realSource].outputs.push({
        reason: sourceCondition ? `condition-${sourceCondition}` : 'step',
        stepIndex: realTarget
      })
    }
  })

  return doc
}
module.exports.before = before

AutoForm.addHooks(['updateFlowForm'], {
  before: {
    method: function (doc) {
      return before(doc)
    }
  },
  after: {
    method: (error, result) => {
      if (error) {
        return;
      }
      jsPlumb.ready(function() {
        jsPlumbUtil.logEnabled = false
        $('#flow-editor .card').remove()
        jsPlumb.deleteEveryConnection()
      })

      // Router.go('flows.one', result)
      location.reload();
    }
  }
})
