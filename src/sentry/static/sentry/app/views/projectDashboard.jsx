import jQuery from 'jquery';
import React from 'react';
import {Link} from 'react-router';

import EventList from './projectDashboard/eventList';
import TeamStatsBar from './projectDashboard/statsBar';
import ProjectState from '../mixins/projectState';
import ProjectChart from './projectDashboard/chart';
import TopIssueTypePieChart from './projectDashboard/topIssueTypePieChart';
import TopIssuePersonPieChart from './projectDashboard/topIssuePersonPieChart';
import {t} from '../locale';


const PERIOD_HOUR = '1h';
const PERIOD_DAY = '1d';
const PERIOD_WEEK = '1w';
const PERIODS = new Set([PERIOD_HOUR, PERIOD_DAY, PERIOD_WEEK]);


const ProjectDashboard = React.createClass({
  mixins: [
    ProjectState
  ],

  getDefaultProps() {
    return {
      defaultStatsPeriod: PERIOD_DAY
    };
  },

  getInitialState() {
    return {
      statsPeriod: this.props.defaultStatsPeriod,
      ...this.getQueryStringState()
    };
  },

  componentWillMount() {
    this.props.setProjectNavSection('dashboard');
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getQueryStringState(nextProps));
  },

  getQueryStringState(props) {
    props = props || this.props;
    let currentQuery = props.location.query;
    let statsPeriod = currentQuery.statsPeriod;

    if (!PERIODS.has(statsPeriod)) {
      statsPeriod = props.defaultStatsPeriod;
    }

    return {
      statsPeriod: statsPeriod
    };
  },

  getStatsPeriodBeginTimestamp(statsPeriod) {
    let now = new Date().getTime() / 1000;
    switch (statsPeriod) {
      case PERIOD_WEEK:
        return now - 3600 * 24 * 7;
      case PERIOD_HOUR:
        return now - 3600;
      case PERIOD_DAY:
      default:
        return now - 3600 * 24;
    }
  },

  getStatsPeriodResolution(statsPeriod) {
    switch (statsPeriod) {
      case PERIOD_WEEK:
        return '1h';
      case PERIOD_HOUR:
        return '10s';
      case PERIOD_DAY:
      default:
        return '1h';
    }
  },

  getTrendingIssuesEndpoint(dateSince) {
    let params = this.props.params;
    let qs = jQuery.param({
      sort: 'priority',
      query: 'is:unresolved',
      since: dateSince
    });
    return '/projects/' + params.orgId + '/' + params.projectId + '/issues/?' + qs;
  },

  getNewIssuesEndpoint(dateSince) {
    let params = this.props.params;
    let qs = jQuery.param({
      sort: 'new',
      query: 'is:unresolved',
      since: dateSince
    });
    return '/projects/' + params.orgId + '/' + params.projectId + '/issues/?' + qs;
  },
  // 统计分类数据
  getTotalStatIssuesEndpoint() {
    let params = this.props.params;
    let qs = jQuery.param({
      action: 'stat',
      proj_id: params.projectId
    });
    return '/projects/' + params.orgId + '/' + params.projectId + '/stats/?' + qs;
  },
  // 统计出错的排行榜
  getTopIssueTypesEndpoint(n) {
    let params = this.props.params;
    let qs = jQuery.param({
      action: 'topIssueType',
      proj_id: params.projectId,
      cnt: n
    });
    return '/projects/' + params.orgId + '/' + params.projectId + '/stats/?' + qs;
  },

  // 统计出错的程序员榜
  getTopIssuePersonsEndpoint(n) {
    let params = this.props.params;
    let qs = jQuery.param({
      action: 'topIssuePerson',
      proj_id: params.projectId,
      cnt: n
    });
    return '/projects/' + params.orgId + '/' + params.projectId + '/stats/?' + qs;
  },

  render() {
    let {statsPeriod} = this.state;
    let dateSince = this.getStatsPeriodBeginTimestamp(statsPeriod);
    let resolution = this.getStatsPeriodResolution(statsPeriod);
    let {orgId, projectId} = this.props.params;
    let url = `/${orgId}/${projectId}/dashboard/`;
    let routeQuery = this.props.location.query;

    return (
      <div>
        <div>
          <div className="pull-right">
            <div className="btn-group">
              <Link
                to={url}
                query={{...routeQuery, statsPeriod: PERIOD_HOUR}}
                active={statsPeriod === PERIOD_HOUR}
                className={
                  'btn btn-sm btn-default' + (
                    statsPeriod === PERIOD_HOUR ? ' active' : '')}>
                {t('1 hour')}
              </Link>
              <Link
                to={url}
                query={{...routeQuery, statsPeriod: PERIOD_DAY}}
                active={statsPeriod === PERIOD_DAY}
                className={
                  'btn btn-sm btn-default' + (
                    statsPeriod === PERIOD_DAY ? ' active' : '')}>
                {t('1 day')}
              </Link>
              <Link
                to={url}
                query={{...routeQuery, statsPeriod: PERIOD_WEEK}}
                className={
                  'btn btn-sm btn-default' + (
                    statsPeriod === PERIOD_WEEK ? ' active' : '')}>
                    {t('1 week')}
              </Link>
            </div>
          </div>
          <h3>{t('Overview')}</h3>
        </div>
        <ProjectChart
            dateSince={dateSince}
            resolution={resolution} />
        <TeamStatsBar
          endpoint={this.getTotalStatIssuesEndpoint()} />

        <div className="row">
          <div className="col-md-6">
            <EventList
                title={t('Trending Issues')}
                endpoint={this.getTrendingIssuesEndpoint(dateSince)} />
          </div>
          <div className="col-md-6">
            <EventList
                title={t('New Issues')}
                endpoint={this.getNewIssuesEndpoint(dateSince)} />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <TopIssueTypePieChart
              endpoint={this.getTopIssueTypesEndpoint(10)}
              cnt="10"
              params={this.props.params} />
          </div>
          <div className="col-md-6">
            <TopIssuePersonPieChart
              endpoint={this.getTopIssuePersonsEndpoint(10)}
              cnt="10"
              params={this.props.params} />
          </div>
        </div>
      </div>
    );
  }
});

export default ProjectDashboard;
