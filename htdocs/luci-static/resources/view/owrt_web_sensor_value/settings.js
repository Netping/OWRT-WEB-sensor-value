'use strict';
'require form';
'require ui';
'require uci';

return L.view.extend({
	uciConfig: 'owrt_sensor_value',
	handleReset: null,
	load: function() {
		return Promise.all([
			uci.load('owrt_sensor_value')
		])
	},
	render: function() {
		let map, section, option;

		map = new form.Map(this.uciConfig, _('owrt_web_sensors'));

		section = map.section(form.GridSection, 'sensor');
		section.nodescriptions = true;
		section.addremove = true;
		section.anonymous = true;
		section.sortable  = true;
		section.addbtntitle = _('owrt_web_add_sensor');
		section.modaltitle = _('owrt_web_edit_sensor');

		section.filter = (name) =>
			(String(name).includes('prototype') || String(name).includes('globals')) === false;

		option = section.option(form.Value, 'memo', _('owrt_web_name'));
		option.datatype = 'string';
		option.default = _('owrt_web_new');
		option.rmempty = false;

		option = section.option(form.Value, 'unit', _('owrt_web_unit'));
		option.datatype = 'string';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'precision', _('owrt_web_precision'));
		option.datatype = 'string';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'proto', _('owrt_web_proto'));
		option.readonly = true;
		option.value('SNMP');
		option.default = 'SNMP';

		option = section.option(form.Value, 'community', _('owrt_web_snmp_community'));
		option.depends('proto', 'SNMP');
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'address', _('owrt_web_address'));
		option.depends('proto', 'SNMP');
		option.datatype = 'host';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'port', _('owrt_web_snmp_port'));
		option.depends('proto', 'SNMP');
		option.datatype = 'port';
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'oid', _('owrt_web_snmp_oid'));
		option.depends('proto', 'SNMP');
		option.rmempty = false;
		option.validate = (id, value) => ((value.match(/^[a-zA-Z\d+\.]+$/g)) === null) ? _('owrt_web_error_oid') : true;
		option.modalonly = true;

		option = section.option(form.Value, 'timeout', _('owrt_web_snmp_timeout'));
		option.datatype = 'range(1,120)';
		option.default = '5'
		option.rmempty = false;
		option.modalonly = true;

		option = section.option(form.Value, 'period', _('owrt_web_period'));
		option.datatype = 'min(1)';
		option.default = '1'
		option.rmempty = false;
		option.modalonly = true;

		map.render().then((form) => {
			view.prepend(form);
			view.append(E('link', { 'rel': 'stylesheet', 'href': L.resource(`view/owrt_web_sensor_value/assets/styles.css`) }));
		});
	}
});
