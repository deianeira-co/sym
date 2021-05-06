"use strict";

const debug = true;
const alpha = true;

const el_nav = document.querySelector("[data-nav]");
const el_menu_toggle_nav = document.querySelector("[data-menu-toggle-nav]");
const el_menu_toggle_cpanel = document.querySelector("[data-menu-toggle-cpanel]");
const el_menu_toggle_about = document.querySelector("[data-menu-toggle-about]");
const el_about_x = document.querySelector("[data-about-x]");
const el_menu_toggle_log = document.querySelector("[data-menu-toggle-log]");
const el_menu_new = document.querySelector("[data-menu-new]");
const el_menu_export_png = document.querySelector("[data-menu-export-as-png]");
const el_menu_step_backward = document.querySelector("[data-menu-step-backward]");
const el_menu_step_forward = document.querySelector("[data-menu-step-forward]");
const el_menu_plus_divs = document.querySelector("[data-menu-plus-divs]");
const el_menu_minus_divs = document.querySelector("[data-menu-minus-divs]");
const el_menu_open_bg_clr_picker = document.querySelector("[data-menu-open-bg-clr-picker]");
const el_menu_plus_stroke_width = document.querySelector("[data-menu-plus-stroke-width]");
const el_menu_minus_stroke_width = document.querySelector("[data-menu-minus-stroke-width]");
const el_menu_open_stroke_clr_picker = document.querySelector("[data-menu-open-stroke-clr-picker]");
const el_menu_toggle_cursor = document.querySelector("[data-menu-toggle-cursor]");
const el_menu_toggle_mirror = document.querySelector("[data-menu-toggle-mirror]");
const el_menu_toggle_additive = document.querySelector("[data-menu-toggle-additive]");
const el_menu_toggle_particle = document.querySelector("[data-menu-toggle-particle]");
const el_menu_toggle_spill = document.querySelector("[data-menu-toggle-spill]");
const el_menu_toggle_break_me = document.querySelector("[data-menu-toggle-break-me]");
const el_log = document.querySelector("[data-log]");
const el_log_list = document.querySelector("[data-log-list]");
const el_cpanel = document.querySelector("[data-cpanel]");
const el_ctrl_divs = document.querySelector("[data-cpanel-divs]");
const el_ctrl_angle = document.querySelector("[data-cpanel-angle]");
const el_ctrl_mirror_scale_x = document.querySelector("[data-cpanel-mirror-scale-x]");
const el_ctrl_mirror_scale_y = document.querySelector("[data-cpanel-mirror-scale-y]");
const el_ctrl_bg_clr = document.querySelector("[data-cpanel-bg-clr]");
const el_ctrl_stroke_width = document.querySelector("[data-cpanel-stroke-width]");
const el_ctrl_stroke_clr = document.querySelector("[data-cpanel-stroke-clr]");
const el_ctrl_stroke_opacity = document.querySelector("[data-cpanel-stroke-opacity]");
const el_about = document.querySelector("[data-about]");

const el_canvas = document.querySelector("[data-canvas]");
const ctx = el_canvas.getContext("2d", { alpha: true });
let canvas_width = window.innerWidth;
let canvas_height = window.innerHeight;

if (!debug) {
    document.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
}

let canvas_is_target = false;

let divs = el_ctrl_divs.value;
let angle = el_ctrl_angle.value / divs;
let mirror_scale_x = el_ctrl_mirror_scale_x.value;
let mirror_scale_y = el_ctrl_mirror_scale_y.value;

let actions = [];
let trimmed_actions = [];

let guides = true;
let mirror_mode = true;
let additive_mode = false;
let particle_mode = false;
let spill_mode = false;
let break_me = false;

let items_logged = 0;

let mouse_down = 0;

const mouse = {
    x: 0,
    y: 0
};

const prev_mouse = {
    x: 0,
    y: 0
};

let half_canvas_x = canvas_width / 2;
let half_canvas_y = canvas_height / 2;

const is_whole_number = function(value) {
    return value % 1 === 0;
};

const radians_from_deg = function(deg) {
    return deg * (Math.PI / 180);
};

const toggle_el_visibility = function(el) {
    const el_name = el.classList[0];

    if (el.classList.contains(`${el_name}--hidden`)) {
        log(`reveal ${el_name}`);

        el.classList.remove(`${el_name}--hidden`);
    } else {
        log(`hide ${el_name}`);

        el.classList.add(`${el_name}--hidden`);
    }
};

const toggle_cursor = function() {
    if (document.body.classList.contains("cursor-hidden")) {
        document.body.classList.remove("cursor-hidden");
    } else {
        document.body.classList.add("cursor-hidden");
    }
};

const download_image = function(data, filename, type) {
   el_canvas.toBlob(function(blob) {
       let link = document.createElement("a");

       link.download = `sym${Date.now()}.png`;
       link.href = URL.createObjectURL(blob);
       link.click();

       URL.revokeObjectURL(link.href)
   }, "image/png");
};

const log = function(msg) {
    items_logged += 1;

    const log_list_item = document.createElement("span");
    log_list_item.classList.add("log__item");

    log_list_item.textContent = `${items_logged}: ${msg}`;
    
    el_log_list.appendChild(log_list_item);
    el_log_list.scrollTop = el_log_list.scrollHeight;
};

const step_backward = function() {
    if (actions.length >= 1) {
        trimmed_actions.push(actions.pop());
    }
};

const step_forward = function() {
    if (trimmed_actions.length >= 1) {
        actions.push(trimmed_actions.pop());
    }
};

const clear_actions = function() {
    actions = [];
    trimmed_actions = [];
};

const confirm_and_start_new_canvas = function() {
    if (confirm("Creating a new canvas will erase your current canvas.\n\nThis action is irreversible.")) {
        clear_actions();
    }
};

const plus_divs = function() {
    el_ctrl_divs.value++;
    log(`increased divs to ${el_ctrl_divs.value}`);
};

const minus_divs = function() {
    el_ctrl_divs.value--;
    log(`decreased divs to ${el_ctrl_divs.value}`);
};

const plus_mirror_scale_x = function() {
    el_ctrl_mirror_scale_x.value++;
    log(`increased mirror offset to ${el_ctrl_mirror_scale_x.value}`);
}

const minus_mirror_scale_x = function() {
    el_ctrl_mirror_scale_x.value--;
    log(`decreased mirror offset to ${el_ctrl_mirror_scale_x.value}`);
}

const plus_mirror_scale_y = function() {
    el_ctrl_mirror_scale_y.value++;
    log(`increased mirror offset to ${el_ctrl_mirror_scale_y.value}`);
}

const minus_mirror_scale_y = function() {
    el_ctrl_mirror_scale_y.value--;
    log(`decreased mirror offset to ${el_ctrl_mirror_scale_y.value}`);
}

const plus_stroke_width = function() {
    el_ctrl_stroke_width.value++;
    log(`increased stroke width to ${el_ctrl_stroke_width.value}`);
};

const minus_stroke_width = function() {
    el_ctrl_stroke_width.value--;
    log(`decreased stroke width to ${el_ctrl_stroke_width.value}`);
};

const open_stroke_clr_picker = function() {
    el_ctrl_stroke_clr.click();
};

const open_bg_clr_picker = function() {
    el_ctrl_bg_clr.click();
};

const toggle_mirror = function() {
    mirror_mode = !mirror_mode;
    log(`mirror ${(mirror_mode === true ? "enabled" : "disabled")}`);
};

const toggle_additive = function() {
    additive_mode = !additive_mode;
    log(`additive ${(additive_mode === true ? "enabled" : "disabled")}`);
};

const toggle_particle = function() {
    particle_mode = !particle_mode;
    log(`particle ${(particle_mode === true ? "enabled" : "disabled")}`);
};

const toggle_spill = function() {
    spill_mode = !spill_mode;
    log(`spill ${(spill_mode === true ? "enabled" : "disabled")}`);
};

const toggle_break_me = function() {
    break_me = !break_me;
    log(`break me ${(break_me === true ? "enabled" : "disabled")}`);
};

const handle_kb_event = function(event) {
    log(`[${event.code}]`);

    switch (event.code) {
        case "Space":
            toggle_el_visibility(el_cpanel);
        case "Tab":
            event.preventDefault();
            break;
        case "Escape":
            toggle_el_visibility(el_nav);
            break;
        case "Slash":
            toggle_el_visibility(el_about);
            break;
        case "Backquote":
            toggle_el_visibility(el_log);
            break;
        case "KeyN":
            confirm_and_start_new_canvas();
            break;
        case "KeyE":
            download_image();
            break;
        case "KeyZ":
            step_backward();
            break;
        case "KeyX":
            step_forward();
            break;
        case "Quote":
            event.preventDefault();
            plus_divs();
            break;
        case "Semicolon":
            event.preventDefault();
            minus_divs();
            break;
        case "BracketRight":
            plus_stroke_width();
            break;
        case "BracketLeft":
            minus_stroke_width();
            break;
        case "KeyC":
            open_stroke_clr_picker();
            break;
        case "KeyB":
            open_bg_clr_picker();
            break;
        case "KeyH":
            toggle_cursor();
            break;
        case "KeyM":
            toggle_mirror();
            break;
        case "KeyA":
            toggle_additive();
            break;
        case "KeyP":
            toggle_particle();
            break;
        case "KeyS":
            toggle_spill();
            break;
        case "Digit8":
            toggle_break_me();
            break;
    }
};

const init_ev_listeners = function() {
    const events_to_listen = [
        {
            el: el_menu_toggle_nav,
            ev: "click",
            func: function() {
                toggle_el_visibility(el_nav);
            }
        },
        {
            el: el_menu_toggle_cpanel,
            ev: "click",
            func: function() {
                toggle_el_visibility(el_cpanel);
            }
        },
        {
            el: el_menu_toggle_about,
            ev: "click",
            func: function() {
                toggle_el_visibility(el_about);
            }
        },
        {
            el: el_about_x,
            ev: "click",
            func: function() {
                toggle_el_visibility(el_about);
            }
        },
        {
            el: el_menu_toggle_log,
            ev: "click",
            func: function() {
                toggle_el_visibility(el_log);
            }
        },
        {
            el: el_menu_step_backward,
            ev: "click",
            func: function() {
                step_backward();
            }
        },
        {
            el: el_menu_step_forward,
            ev: "click",
            func: function() {
                step_forward();
            }
        },
        {
            el: el_menu_new,
            ev: "click",
            func: function() {
                confirm_and_start_new_canvas();            
            }
        },
        {
            el: el_menu_export_png,
            ev: "click",
            func: function() {
                download_image();
            }
        },
        {
            el: el_menu_plus_divs,
            ev: "click",
            func: function() {
                plus_divs();
            }
        },
        {
            el: el_menu_minus_divs,
            ev: "click",
            func: function() {
                minus_divs();
            }
        },
        {
            el: el_menu_open_bg_clr_picker,
            ev: "click",
            func: function() {
                open_bg_clr_picker();
            }
        },
        {
            el: el_menu_plus_stroke_width,
            ev: "click",
            func: function() {
                plus_stroke_width();
            }
        },
        {
            el: el_menu_minus_stroke_width,
            ev: "click",
            func: function() {
                minus_stroke_width();
            }
        },
        {
            el: el_menu_open_stroke_clr_picker,
            ev: "click",
            func: function() {
                open_stroke_clr_picker();
            }
        },
        {
            el: el_menu_toggle_cursor,
            ev: "click",
            func: function() {
                toggle_cursor();
            }
        },
        {
            el: el_menu_toggle_mirror,
            ev: "click",
            func: function() {
                toggle_mirror();
            }
        },
        {
            el: el_menu_toggle_additive,
            ev: "click",
            func: function() {
                toggle_additive();
            }
        },
        {
            el: el_menu_toggle_particle,
            ev: "click",
            func: function() {
                toggle_particle();
            }
        },
        {
            el: el_menu_toggle_spill,
            ev: "click",
            func: function() {
                toggle_spill();
            }
        },
        {
            el: el_menu_toggle_break_me,
            ev: "click",
            func: function() {
                toggle_break_me();
            }
        },
        {
            el: window,
            ev: "resize",
            func: function() {
                canvas_width = window.innerWidth;
                canvas_height = window.innerHeight;

                half_canvas_x = canvas_width / 2;
                half_canvas_y = canvas_height / 2;

                setup();
            }
        },
        {
            el: el_canvas,
            ev: "mousemove",
            func: function(event) {
                mouse.x = event.pageX - this.offsetLeft;
                mouse.y = event.pageY - this.offsetTop;

                const mx = mouse.x - half_canvas_x;
                const my = mouse.y - half_canvas_y;
                const pmx = prev_mouse.x - half_canvas_x;
                const pmy = prev_mouse.y - half_canvas_y;

                if (spill_mode) {
                    actions.push({x: mx, y: my, px: pmx, py: pmy});

                    if (break_me) {
                        console.log(undefined_var);
                    }
                } else if (mouse_down) {
                    actions.push({x: mx, y: my, px: pmx, py: pmy});

                    if (break_me) {
                        console.log(undefined_var);
                    }
                }

                prev_mouse.x = mouse.x;
                prev_mouse.y = mouse.y;
            }
        },
        {
            el: document,
            ev: "keydown",
            func: function(event) {
                handle_kb_event(event);
            }
        },
        {
            el: document,
            ev: "mouseup",
            func: function(event) {
                --mouse_down;
            }
        },
        {
            el: document,
            ev: "mousedown",
            func: function(event) {
                ++mouse_down;
            }
        }
    ];

    for (let i = 0; i < events_to_listen.length; i++) {
        const event_obj = events_to_listen[i];

        event_obj.el.addEventListener(event_obj.ev, event_obj.func);
    }
};

const setup = function() {
    document.body.style.backgroundColor = el_ctrl_bg_clr.value;

    el_canvas.style.width = canvas_width + "px";
    el_canvas.style.height = canvas_height + "px";

    const dpr = window.devicePixelRatio;
    el_canvas.width = canvas_width * dpr;
    el_canvas.height = canvas_height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineWidth = el_ctrl_stroke_width.value;
    ctx.strokeStyle = el_ctrl_stroke_clr.value;

    ctx.translate(half_canvas_x, half_canvas_y);
};

const update = function() {
    requestAnimationFrame(update);

    divs = el_ctrl_divs.value;
    angle = el_ctrl_angle.value / divs;
    mirror_scale_x = el_ctrl_mirror_scale_x.value;
    mirror_scale_y = el_ctrl_mirror_scale_y.value;

    if (!additive_mode) {
        ctx.fillStyle = el_ctrl_bg_clr.value;
        ctx.fillRect(0 - half_canvas_x, 0 - half_canvas_y, el_canvas.width, el_canvas.height);
    }

    // this causes mayhem when divs is a decimal value, i like it.
    if (particle_mode && !is_whole_number(divs)) {
        ctx.clearRect(0 - half_canvas_x, 0 - half_canvas_y, el_canvas.width, el_canvas.height);
    }

    if (particle_mode) {
        ctx.clearRect(0 - half_canvas_x, 0 - half_canvas_y, canvas_width, canvas_height);
    }

    document.body.style.backgroundColor = el_ctrl_bg_clr.value;
    ctx.lineWidth = el_ctrl_stroke_width.value;
    ctx.strokeStyle = el_ctrl_stroke_clr.value;

    ctx.beginPath();
    for (let i = 0; i < actions.length; i++) {
        for (let j = 0; j < divs; j++) {
            ctx.rotate(radians_from_deg(angle));
        
            ctx.moveTo(actions[i].x, actions[i].y);
            ctx.lineTo(actions[i].px, actions[i].py);

            if (mirror_mode) {
                ctx.save();
                ctx.scale(mirror_scale_x, -mirror_scale_y);
                ctx.moveTo(actions[i].x, actions[i].y);
                ctx.lineTo(actions[i].px, actions[i].py);
                ctx.restore();
            }
        }
    }
    ctx.stroke();
};

const init = function() {
    setup();
    init_ev_listeners();
    update();
};

init();
