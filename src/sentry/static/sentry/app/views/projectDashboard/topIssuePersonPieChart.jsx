import jQuery from 'jquery';
import React from 'react';
import ApiMixin from '../../mixins/apiMixin';
import LoadingError from '../../components/loadingError';
import LoadingIndicator from '../../components/loadingIndicator';
import {t} from '../../locale';

import ReactEcharts from 'echarts-for-react';

const TopIssuePersonPieChart = React.createClass({
  propTypes: {
    endpoint: React.PropTypes.string.isRequired,
    cnt: React.PropTypes.string.isRequired,
    params: React.PropTypes.object.isRequired
  },

  mixins: [
    ApiMixin
  ],
  getInitialState() {
    return {
      statsData: {},
      loading: true,
      error: false
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentWillReceiveProps() {
    this.setState({
      loading: true,
      error: false
    }, this.fetchData);
  },

  fetchData() {
    this.api.request(this.props.endpoint, {
      query: {
      },
      success: (data) => {
        this.setState({
          statsData: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },
  // 将statData转为echart option
  getOption() {
    let legend_data = [];
    let series_data = [];
    let statsDict = {};
    for (let e in this.state.statsData) {
      e = this.state.statsData[e];
      legend_data.push(e['name']);
      series_data.push({'name': e['name'], 'value': e['value']});
      statsDict[e['name']] = e['value'];
    }
    let testOption = {
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: legend_data,
            formatter: function (name) {
                return '['+ statsDict[name] +'] ' + name;
            }
        },
        series : [{
            name: 'Trace指派人',
            type: 'pie',
            radius : '55%',
            center: ['50%', '60%'],
            data: series_data,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    return testOption;
  },
  // Top Person图表加事件
  onChartClicked(params, chart) {
    if (params && params.dataIndex >= 0) {
      let root_url = '/' + this.props.params.orgId + '/' + this.props.params.projectId + '/?';
      let email = this.state.statsData[params.dataIndex].email;
      if (email) {
        let qs = jQuery.param({
          query: "assigned:" + email
        });
        window.open(root_url + qs, "_blank");
      }
    }
  },
  render() {
    let option = this.getOption();
    let chartTitle = 'Trace指派人 TOP ' + this.props.cnt + "占比情况";
    let onEvents = {
      'click': this.onChartClicked
    };

    return (
      <div className="box dashboard-widget">
        <div className="box-header clearfix">
          <div className="row">
            <center><h3>{chartTitle}</h3></center>
          </div>
        </div>
        <div className="box-content">
          <ReactEcharts
            style={{height:'400px'}}
            option={option} 
            onEvents={onEvents} />
          </div>
      </div>
    );
  }
});
export default TopIssuePersonPieChart;
