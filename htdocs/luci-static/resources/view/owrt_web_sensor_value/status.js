'use strict';
'require ui';
'require uci';
'require poll';
'require rpc';

return L.view.extend({
	uciConfig: 'owrt_sensor_value',
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,
	load: function() {
		return Promise.all([
			uci.load(this.uciConfig)
		]);
	},
	rpcCall: rpc.declare({
		object: 'owrt_sensor_value',
		method: 'get_state',
		params: [ 'id_sensor' ],
		expect: {}
	}),
	updateTable: (id, result, items) => {
		const statuses = {
			'-2': _('owrt_web_status_notpolled'),
			'-1': _('owrt_web_status_unknown'),
			'0': _('owrt_web_status_norm'),
			'1': _('owrt_web_status_timeout'),
			'2': _('owrt_web_status_error')
		}
		items.forEach((item) => {
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
	render: function(html) {

		const sensors = uci.sections(this.uciConfig, 'sensor').filter((e) =>
			(String(e['.name']).includes('prototype') || String(e['.name']).includes('globals')) === false);

		let items = [];
		let rows = E([]);
		for (const item in sensors) {
			const sensor = sensors[item];
			const sensorId = sensor['.name'];
			let row = E('tr', {
				'data-id': sensorId, 'class' : 'sensor'
			}, [
				E('td', { 'data-id': 'memo' }, [
					E('div', { 'class': 'sensor__name' }, sensor.memo),
				]),
				E('td', { 'data-id': 'value' }, '&#9711'),
				E('td', { 'data-id': 'status' }, '&#9711')
			]);
			items.push(row);
			rows.appendChild(row);
		}

		sensors.forEach((sensor) => {
			const id = sensor['.name'];
			const period = sensor['period'];
			poll.add(() =>
				L.resolveDefault(this.rpcCall(id))
					.then((result) => {
						if (result === 4) {
							poll.stop();
							return;
						}
						this.updateTable(id, result, items);
					})
			, period);
		});

		let body = E([
			E('link', { 'rel': 'stylesheet', 'href': L.resource('view/owrt_web_sensor_value/assets/styles.css') }),
			E('h2', _('owrt_web_sensors_status')),
			E('div', { 'class': ''}, [
				E('table', { 'class': 'sensors-table' }, [
					E('tr', { 'class' : '' }, [
						E('th', { 'class' : 'sensors-table__name' }, _('owrt_web_name')),
						E('th', { 'class' : 'sensors-table__value' }, _('owrt_web_value')),
						E('th', { 'class' : 'sensors-table__status' }, _('owrt_web_status'))
					]
				), rows ])
			]),
		]);

		return body;
	}
});
