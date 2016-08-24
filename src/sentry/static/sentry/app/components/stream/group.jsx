import jQuery from 'jquery';
import React from 'react';
import Reflux from 'reflux';
import {Link} from 'react-router';

import AssigneeSelector from '../assigneeSelector';
import RedmineId from '../redmineId'; // add by hzwangzhiwei @20160411
import Count from '../count';
import GroupChart from './groupChart';
import GroupCheckBox from './groupCheckBox';
import TimeSince from '../timeSince';

import GroupStore from '../../stores/groupStore';
import SelectedGroupStore from '../../stores/selectedGroupStore';

import {valueIsEqual} from '../../utils';

const StreamGroup = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    orgId: React.PropTypes.string.isRequired,
    projectId: React.PropTypes.string.isRequired,
    statsPeriod: React.PropTypes.string.isRequired,
    canSelect: React.PropTypes.bool
  },

  mixins: [
    Reflux.listenTo(GroupStore, 'onGroupChange')
  ],

  getDefaultProps() {
    return {
      canSelect: true,
      id: '',
      statsPeriod: '24h'
    };
  },

  getInitialState() {
    return {
      data: GroupStore.get(this.props.id)
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        data: GroupStore.get(this.props.id)
      });
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.statsPeriod !== this.props.statsPeriod) {
      return true;
    }
    if (!valueIsEqual(this.state.data, nextState.data)) {
      return true;
    }
    return false;
  },

  onGroupChange(itemIds) {
    if (!itemIds.has(this.props.id)) {
      return;
    }
    let id = this.props.id;
    let data = GroupStore.get(id);
    this.setState({
      data: data,
    });
  },

  toggleSelect(evt) {
    if (evt.target.tagName === 'A')
      return;
    if (evt.target.tagName === 'INPUT')
      return;
    if (jQuery(evt.target).parents('a').length !== 0)
      return;

    SelectedGroupStore.toggleSelect(this.state.data.id);
  },

  render() {
    let data = this.state.data;
    // let userCount = data.userCount;

    let className = 'group row';
    if (data.isBookmarked) {
      className += ' isBookmarked';
    }
    if (data.hasSeen) {
      className += ' hasSeen';
    }
    if (data.status === 'resolved') {
      className += ' isResolved';
    }
    if (data.status === 'muted') {
      className += ' isMuted';
    }

    className += ' level-' + data.level;
    className += ' group_issue_row'; // add by hzwangzhiwei @20160412
    let {id, orgId, projectId} = this.props;

    return (
      <li className={className} onClick={this.toggleSelect}>
        <div className="col-md-6 col-xs-8 event-details">
          {this.props.canSelect &&
            <div className="checkbox">
              <GroupCheckBox id={data.id} />
            </div>
          }
          <h3 className="truncate">
            <Link to={`/${orgId}/${projectId}/issues/${data.id}/`}>
              <span className="error-level truncate">{data.level}</span>
              <span className="icon icon-soundoff"></span>
              <span className="icon icon-bookmark"></span>
              {data.title}
            </Link>
          </h3>
          <div className="event-message truncate">
            <span className="message">{data.culprit}</span>
          </div>
          <div className="event-extra">
            <ul>
              <li>
                <span className="icon icon-clock"></span>
                <TimeSince date={data.lastSeen} />
                &nbsp;&mdash;&nbsp;
                <TimeSince date={data.firstSeen} suffix="old" />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="icon fa fa-server"></span>
                <span className="server_name_span_hzwangzhiwei">{data.tags.server_name}</span>
              </li>
              {data.numComments !== 0 &&
                <li>
                  <Link to={`/${orgId}/${projectId}/issues/${id}/activity/`} className="comments">
                    <span className="icon icon-comments"></span>
                    <span className="tag-count">{data.numComments}</span>
                  </Link>
                </li>
              }
              {data.logger &&
                <li className="event-annotation">
                  <Link to={`/${orgId}/${projectId}/`} query={{query: 'logger:' + data.logger}}>
                    {data.logger}
                  </Link>
                </li>
              }
              {data.annotations.map((annotation, key) => {
                return (
                  <li className="event-annotation"
                      dangerouslySetInnerHTML={{__html: annotation}}
                      key={key} />
                );
              })}
            </ul>
          </div>
        </div>
        <div className="event-assignee col-md-1 hidden-sm hidden-xs">
          <AssigneeSelector id={data.id} />
        </div>
        <div className="event-assignee col-md-1 hidden-sm hidden-xs">
          <span title="我来跟进" className="icon fa fa-fort-awesome"></span>
          <div className="assign_name_hzwangzhiwei">王志伟</div>
        </div>
        <div className="col-md-2 hidden-sm hidden-xs event-graph align-right">
          <GroupChart id={data.id} statsPeriod={this.props.statsPeriod} />
        </div>
        <div className="col-md-1 col-xs-2 event-count align-right">
          <Count value={data.count} />
        </div>
        <div className="col-md-1 col-xs-2 event-users align-right redmine_col">
          <RedmineId id={data.id} redmineId={data.redmineId} redmineURL={data.project.redmine} />
        </div>
      </li>
    );
  }
});

export default StreamGroup;
