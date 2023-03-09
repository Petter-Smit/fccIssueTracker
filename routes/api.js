"use strict";
const Issue = require("../models/issues");

const filterInputs = (props) => {
  let builtObj = {};
  if (props.issue_title) builtObj.issue_title = props.issue_title;
  if (props.issue_text) builtObj.issue_text = props.issue_text;
  if (props.created_by) builtObj.created_by = props.created_by;
  if (props.assigned_to) builtObj.assigned_to = props.assigned_to;
  if (props.open) builtObj.open = props.open;
  if (props.status_text) builtObj.status_text = props.status_text;
  if (props._id) builtObj._id = props._id;
  return builtObj;
};

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async function (req, res) {
      const project = req.params.project;
      const passedParams = filterInputs(req.query);
      let output;
      try {
        output = await Issue.find({ project_name: project, ...passedParams });
      } catch (err) {
        res.json(err);
      }
      res.json(output);
    })

    .post(async function (req, res) {
      let project = req.params.project;
      let {
        issue_title,
        issue_text,
        created_by,
        open = true,
        status_text = "",
        assigned_to = "",
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
      } else {
        let newIssue = new Issue({
          project_name: project,
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          open: open,
          status_text: status_text,
          assigned_to: assigned_to,
        });
        let returnedIssue = await newIssue.save();
        res.json(returnedIssue);
      }
    })

    .put(async function (req, res) {
      const id = req.body._id;
      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }
      const project = req.params.project;
      let passedParams = filterInputs(req.body);
      let response;
      if (Object.keys(passedParams).length <= 1) {
        res.json({ error: "no update field(s) sent", _id: id });
        return;
      }
      passedParams.updated_on = new Date();
      if (!passedParams.open) {
        passedParams.open = true;
      }

      const foundIssue = await Issue.findOne({ _id: id });
      if (!foundIssue) {
        res.json({ error: "could not update", _id: id });
        return;
      }

      Object.keys(passedParams).map(
        (param) => (foundIssue[param] = passedParams[param])
      );
      foundIssue.updated_on = new Date();
      const issueAfterUpdate = await foundIssue.save();
      res.json({ result: "successfully updated", _id: id });
    })

    .delete(async function (req, res) {
      const id = req.body._id;
      const project = req.params.project;
      let response;
      if (!req.body._id) {
        response = { error: "missing _id" };
      } else
        try {
          let deletedObject = await Issue.findOneAndDelete({
            _id: id,
          });
          if (deletedObject) {
            response = { result: "successfully deleted", _id: id };
          } else {
            response = { error: "could not delete", _id: id };
          }
        } catch (err) {
          response = { error: "could not delete", _id: id };
        }
      res.json(response);
    });
};
