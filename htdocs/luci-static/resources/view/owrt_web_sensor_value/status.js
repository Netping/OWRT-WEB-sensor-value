'use strict';
'require ui';
'require uci';
'require poll';
'require rpc';
'require fs';

let sensors, reloadInterval = 5, uciConfig = 'owrt-sensor-value';

const table = {
	updateData: (id, result, tdesc) => {
		const statuses = {
			'-2': _('owrt_web_status_notpolled'),
			'-1': _('owrt_web_status_unknown'),
			'0': _('owrt_web_status_norm'),
			'1': _('owrt_web_status_timeout'),
			'2': _('owrt_web_status_error')
		}
		table.getElement().querySelectorAll('tr').forEach((item) => {
			if (item.dataset.id === id) {
				item.querySelector('td[data-id="value"]').replaceChildren(E('span',
					`${result.value}${result.unit}`
				));
				item.querySelector('td[data-id="status"]').replaceChildren(E('span',
					{ 'class': `sensor__status sensor__status--${result.status}` },
					`${statuses[result.status]}`
				));
			}
		});
	},
	buildRows: (sensors) => {
		let rows = E([]);
		for (const item in sensors) {
			const sensor = sensors[item];
			const sensorId = sensor['.name'];
			let row = E('tr', {
				'data-id': sensorId,
				'class': 'sensor'
			}, [
				E('td', { 'data-id': 'memo' }, [
					E('div', { 'class': 'sensor__name' }, sensor.memo),
				]),
				E('td', { 'data-id': 'value' }, '&#9711'),
				E('td', { 'data-id': 'status' }, '&#9711')
			]);
			rows.appendChild(row);
		}
		return rows;
	},
	getElement: () => document.querySelector('table.sensors-table tbody'),
	renderRows: () => table.getElement().replaceChildren(table.buildRows(sensors))
}

const rpcGetState = rpc.declare({
	object: 'owrt-sensor-value',
	method: 'get_value',
	params: [ 'id_sensor' ],
	expect: {}
});

let reloadCounter = 0;

const pollAction = () => {
	for (let index in sensors) {
		const sensor = sensors[index];
		const [ id, name, period ] = [ sensor['.name'], sensor['name'], sensor['period'] ];
		L.resolveDefault(rpcGetState(id))
			.then((result) => {
				if (typeof result !== 'object') {
					console.error('json', result);
					poll.stop();
					return;
				}
				table.updateData(id, result);
			});
	}
	reloadCounter++;
	if (reloadCounter === reloadInterval) {
		reloadCounter = 0;
		loadConfiguration();
	}
}

const getSensors = (json) => {
	let sensors = [];
	const values = json.values;
	for (let value in values) {
		const item = values[value];
		if ((item['.name'].includes('prototype') || item['.name'].includes('globals')) === false) {
			sensors.push(item);
		}
	}
	return sensors;
}

const loadConfiguration = () => {
	if (poll.active()) {
		poll.remove(pollAction);
	};
	L.resolveDefault(fs.exec_direct('ubus', ['call', 'uci', 'get', "{'config':'owrt-sensor-value'}"], 'json'))
		.then(function(json) {
			sensors = getSensors(json);
			poll.add(pollAction, 1);
			table.renderRows();
		});
}


return L.view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
	load: function() {
		return L.resolveDefault(loadConfiguration())
	},
	render: function(rows) {
		const body = E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_sensor_value/assets/styles.css') }),
			E('h2', _('owrt_web_sensors_status')),
			E('div', { 'class': ''}, [
				E('table', { 'class': 'sensors-table' }, [
					E('thead', [
						E('tr', { 'class' : '' }, [
							E('th', { 'class' : 'sensors-table__name' }, _('owrt_web_name')),
							E('th', { 'class' : 'sensors-table__value' }, _('owrt_web_value')),
							E('th', { 'class' : 'sensors-table__status' }, _('owrt_web_status'))
						])
					]),
					E('tbody', [ rows ])
				])
			]),
		]);
		return body;
	}
});
