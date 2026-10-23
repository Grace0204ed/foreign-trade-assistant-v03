(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GlobalFreightCalculator = factory();
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const round = (value, digits = 3) => {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  };
  const positive = (value, label, allowZero = false) => {
    const number = Number(value);
    if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) throw new Error(`${label}必须是${allowZero ? "非负" : "大于零的"}数字`);
    return number;
  };
  function volume(input) {
    const quantity = positive(input.quantity || 1, "数量");
    let unitVolume;
    if (input.mode === "direct") {
      const entered = positive(input.directVolume, "体积");
      if (input.directKind === "total") return { unitVolume: round(entered / quantity), totalVolume: round(entered), quantity };
      unitVolume = entered;
    } else {
      const unitFactors = { m: 1, cm: 0.01, mm: 0.001 };
      const factor = unitFactors[input.lengthUnit] || 1;
      unitVolume = positive(input.length, "长度") * positive(input.width, "宽度") * positive(input.height, "高度") * factor ** 3;
    }
    return { unitVolume: round(unitVolume), totalVolume: round(unitVolume * quantity), quantity };
  }
  function freight(input) {
    const measured = volume(input);
    const rate = positive(input.rate, "每立方运费单价", true);
    return { ...measured, rate: round(rate, 4), amount: round(measured.totalVolume * rate, 2) };
  }
  function tokenize(source) {
    const text = String(source || "").replace(/\s+/g, "");
    if (!text) throw new Error("请输入算式");
    if (!/^[0-9+\-*/().]+$/.test(text)) throw new Error("只支持数字、四则运算和括号");
    const tokens = text.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/]/g) || [];
    if (tokens.join("") !== text) throw new Error("算式包含无法识别的内容");
    return tokens;
  }
  function arithmetic(source) {
    const tokens = tokenize(source); let index = 0;
    const peek = () => tokens[index]; const take = () => tokens[index++];
    function primary() {
      const token = take();
      if (token === "+") return primary();
      if (token === "-") return -primary();
      if (token === "(") { const value = expression(); if (take() !== ")") throw new Error("括号不匹配"); return value; }
      const value = Number(token); if (!Number.isFinite(value)) throw new Error("算式格式不正确"); return value;
    }
    function term() { let value = primary(); while (peek() === "*" || peek() === "/") { const op = take(), right = primary(); if (op === "/" && right === 0) throw new Error("不能除以零"); value = op === "*" ? value * right : value / right; } return value; }
    function expression() { let value = term(); while (peek() === "+" || peek() === "-") { const op = take(), right = term(); value = op === "+" ? value + right : value - right; } return value; }
    const result = expression();
    if (index !== tokens.length || !Number.isFinite(result)) throw new Error("算式格式不正确");
    return round(result, 6);
  }

  function mount(options = {}) {
    if (typeof document === "undefined" || document.getElementById("global-freight-calculator")) return;
    const host = document.createElement("aside"); host.id = "global-freight-calculator"; host.className = "global-freight-calculator collapsed no-print";
    host.innerHTML = `<button class="freight-fab" type="button" aria-expanded="false" title="运费计算器">🚢<span>运费计算</span></button><section class="freight-float-panel"><header><div><b>运费计算器</b><small>只计算，不会自动保存或覆盖单证</small></div><button type="button" data-close>×</button></header><div class="freight-tabs"><button class="active" data-mode="volume">体积计费</button><button data-mode="arithmetic">直接算术</button></div><div data-pane="volume"><div class="freight-mode-row"><label><input type="radio" name="float-volume-mode" value="dimensions" checked> 长宽高</label><label><input type="radio" name="float-volume-mode" value="direct"> 直接输入m³</label></div><div data-dimensions class="freight-grid"><label>长<input data-value="length" type="number" min="0" step="any"></label><label>宽<input data-value="width" type="number" min="0" step="any"></label><label>高<input data-value="height" type="number" min="0" step="any"></label><label>长度单位<select data-value="lengthUnit"><option value="m">米 m</option><option value="cm">厘米 cm</option><option value="mm">毫米 mm</option></select></label></div><div data-direct hidden class="freight-grid"><label>体积（m³）<input data-value="directVolume" type="number" min="0" step="any"></label><label>体积含义<select data-value="directKind"><option value="unit">单件体积</option><option value="total">整批总体积</option></select></label></div><div class="freight-grid"><label>数量<input data-value="quantity" type="number" min="1" step="any" value="1"></label><label>每m³单价<input data-value="rate" type="number" min="0" step="any"></label></div><button type="button" class="primary" data-calculate>计算</button><div class="freight-result" data-volume-result>等待计算</div></div><div data-pane="arithmetic" hidden><label>费用算式<input data-expression placeholder="例如 5500+200+300"></label><button type="button" class="primary" data-evaluate>计算（或按 Enter）</button><div class="freight-result" data-arithmetic-result>等待计算</div></div><p class="freight-error" data-error role="alert"></p><footer><button type="button" data-copy>复制结果</button><button type="button" data-apply>填入当前单证</button></footer></section>`;
    document.body.appendChild(host);
    let result = null;
    const error = message => { host.querySelector("[data-error]").textContent = message || ""; };
    const setOpen = open => { host.classList.toggle("collapsed", !open); host.querySelector(".freight-fab").setAttribute("aria-expanded", String(open)); };
    host.querySelector(".freight-fab").onclick = () => setOpen(host.classList.contains("collapsed"));
    host.querySelector("[data-close]").onclick = () => setOpen(false);
    host.querySelectorAll("[data-mode]").forEach(button => button.onclick = () => { host.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("active", b === button)); host.querySelectorAll("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== button.dataset.mode); error(""); });
    host.querySelectorAll('[name="float-volume-mode"]').forEach(input => input.onchange = () => { const direct = input.checked && input.value === "direct"; host.querySelector("[data-direct]").hidden = !direct; host.querySelector("[data-dimensions]").hidden = direct; });
    const values = () => Object.fromEntries([...host.querySelectorAll("[data-value]")].map(input => [input.dataset.value, input.value]));
    host.querySelector("[data-calculate]").onclick = () => { try { const mode = host.querySelector('[name="float-volume-mode"]:checked').value; const data = freight({ ...values(), mode }); result = { amount: data.amount, text: String(data.amount), source: "volume", detail: data }; host.querySelector("[data-volume-result]").innerHTML = `<b>运费：${data.amount}</b><span>单件 ${data.unitVolume} m³ × ${data.quantity} = 总体积 ${data.totalVolume} m³</span>`; error(""); } catch (e) { result = null; error(e.message); } };
    const evaluate = () => { try { const value = arithmetic(host.querySelector("[data-expression]").value); result = { amount: value, text: String(value), source: "arithmetic" }; host.querySelector("[data-arithmetic-result]").innerHTML = `<b>${value}</b>`; error(""); } catch (e) { result = null; error(e.message); } };
    host.querySelector("[data-evaluate]").onclick = evaluate; host.querySelector("[data-expression]").onkeydown = event => { if (event.key === "Enter") { event.preventDefault(); evaluate(); } };
    host.querySelector("[data-copy]").onclick = async () => { if (!result) return error("请先完成计算"); try { await navigator.clipboard.writeText(result.text); error("结果已复制"); } catch { error("复制失败，请手动复制结果"); } };
    host.querySelector("[data-apply]").onclick = () => { if (!result) return error("请先完成计算"); const target = options.getTarget?.(); if (!target) return error("当前没有可填写的报价、PI或合同，仍可复制结果"); const previous = Number(target.currentAmount || 0); const message = `目标：${target.documentLabel || "当前单证"} → ${target.fieldLabel || "运费"}\n金额：${result.amount}${previous ? `\n现有金额 ${previous} 将被替换` : ""}\n确认填入？（不会自动保存）`; if (!confirm(message)) return error("已取消，单证未修改"); options.apply?.(result.amount, result, target); error("已填入当前单证，尚未自动保存"); };
  }
  return { arithmetic, volume, freight, mount };
});
