let schema = {
	notifications: function () {
		
	}
}

let {every, fail, complete, update} = new Streamer(schema);
let [form] = document.forms;

let {name, password, submit} = form.elements;

name.addEventListener('keyup', e => {
	let {value} = e.target;
	update({name: value});
});
password.addEventListener('keyup', e => {
	let {value} = e.target;
	update({password: value});
});

complete(state => {
	submit.disabled = false;
});

fail(state => {
	submit.disabled = true;
})
