(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DocumentLocales=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // Versioned, bundled template text only. Never translate user data or contact/bank identifiers.
  const version=1;
  const languages={en:'英语',fr:'法语',ja:'日语',es:'西班牙语',ru:'俄语',ar:'阿拉伯语',it:'意大利语',de:'德语',ko:'韩语'};
  const extra=['ja','ru','ar','it','de','ko'];
  const rows=`Quotation|見積書|Коммерческое предложение|عرض سعر|Preventivo|Angebot|견적서
Proforma Invoice|プロフォーマインボイス|Проформа-инвойс|فاتورة أولية|Fattura proforma|Proformarechnung|견적송장
Sales Contract|売買契約書|Договор купли-продажи|عقد بيع|Contratto di vendita|Kaufvertrag|매매계약서
Commercial Invoice|商業送り状|Коммерческий инвойс|فاتورة تجارية|Fattura commerciale|Handelsrechnung|상업송장
Packing List|梱包明細書|Упаковочный лист|قائمة التعبئة|Lista di imballaggio|Packliste|포장명세서
Invitation Letter|招聘状|Деловое приглашение|خطاب دعوة|Lettera di invito|Einladungsschreiben|초청장
Letter of Authorization|代理店授権書|Письмо об уполномочивании|خطاب تفويض|Lettera di autorizzazione|Vollmacht|대리점 위임장
Quotation No.|見積番号|Номер предложения|رقم العرض|N. preventivo|Angebotsnummer|견적번호
Proforma Invoice No.|プロフォーマ番号|Номер проформы|رقم الفاتورة الأولية|N. fattura proforma|Proformarechnungsnummer|견적송장 번호
Contract No.|契約番号|Номер договора|رقم العقد|N. contratto|Vertragsnummer|계약번호
Commercial Invoice No.|インボイス番号|Номер инвойса|رقم الفاتورة التجارية|N. fattura commerciale|Handelsrechnungsnummer|상업송장 번호
Packing List No.|梱包明細書番号|Номер упаковочного листа|رقم قائمة التعبئة|N. lista di imballaggio|Packlistennummer|포장명세서 번호
No.|番号|Номер|الرقم|N.|Nr.|번호
Date|日付|Дата|التاريخ|Data|Datum|날짜
Quotation Date|見積日|Дата предложения|تاريخ العرض|Data del preventivo|Angebotsdatum|견적일
Invoice Date|発行日|Дата инвойса|تاريخ الفاتورة|Data fattura|Rechnungsdatum|송장 발행일
Contract Date|契約日|Дата договора|تاريخ العقد|Data contratto|Vertragsdatum|계약일
Packing Date|梱包日|Дата упаковки|تاريخ التعبئة|Data imballaggio|Packdatum|포장일
Valid Until|有効期限|Действительно до|صالح حتى|Valido fino al|Gültig bis|유효기한
Customer Information|顧客情報|Данные покупателя|معلومات العميل|Dati del cliente|Kundeninformationen|고객 정보
Company|会社名|Компания|الشركة|Società|Unternehmen|회사명
Country|国|Страна|الدولة|Paese|Land|국가
Contact|担当者|Контактное лицо|جهة الاتصال|Referente|Ansprechpartner|담당자
Phone|電話|Телефон|الهاتف|Telefono|Telefon|전화
Email|メール|Эл. почта|البريد الإلكتروني|E-mail|E-Mail|이메일
Address|住所|Адрес|العنوان|Indirizzo|Adresse|주소
Seller|売主|Продавец|البائع|Venditore|Verkäufer|판매자
Buyer|買主|Покупатель|المشتري|Acquirente|Käufer|구매자
Shipper|荷送人|Грузоотправитель|الشاحن|Mittente|Versender|송하인
Consignee|荷受人|Грузополучатель|المرسل إليه|Destinatario|Empfänger|수하인
Notify Party|着荷通知先|Уведомляемая сторона|جهة الإخطار|Parte da notificare|Benachrichtigungsadresse|착하 통지처
Quotation Items|見積明細|Позиции предложения|بنود العرض|Voci del preventivo|Angebotspositionen|견적 명세
Proforma Invoice Items|プロフォーマ明細|Позиции проформы|بنود الفاتورة الأولية|Voci della proforma|Proformapositionen|견적송장 명세
Contract Items|契約明細|Позиции договора|بنود العقد|Voci del contratto|Vertragspositionen|계약 명세
Invoice Items|請求明細|Позиции инвойса|بنود الفاتورة|Voci della fattura|Rechnungspositionen|송장 명세
Packing Items|梱包明細|Состав груза|بنود التعبئة|Dettagli imballaggio|Packpositionen|포장 명세
Deposit|前払金|аванс|دفعة مقدمة|acconto|Anzahlung|계약금
Balance before shipment|出荷前残金|остаток до отгрузки|الرصيد قبل الشحن|saldo prima della spedizione|Restzahlung vor Versand|선적 전 잔금
Payment before shipment|出荷前全額支払|оплата до отгрузки|دفع كامل قبل الشحن|pagamento prima della spedizione|Zahlung vor Versand|선적 전 전액 지급
Condition|状態|Состояние|الحالة|Condizione|Zustand|상태
Item Type|項目区分|Тип позиции|نوع البند|Tipo di voce|Positionstyp|항목 유형
Product Description|商品説明|Описание товара|وصف المنتج|Descrizione prodotto|Produktbeschreibung|상품 설명
Description|説明|Описание|الوصف|Descrizione|Beschreibung|설명
Brand|ブランド|Марка|العلامة التجارية|Marca|Marke|브랜드
Model|型式|Модель|الطراز|Modello|Modell|모델
Year|製造年|Год выпуска|سنة الصنع|Anno|Baujahr|제조연도
Working Hours|稼働時間|Наработка|ساعات التشغيل|Ore di lavoro|Betriebsstunden|가동시간
HS CODE|HSコード|Код ТН ВЭД|رمز النظام المنسق|Codice SA|HS-Code|HS 코드
Quantity|数量|Количество|الكمية|Quantità|Menge|수량
Billing Unit|単位|Единица расчёта|وحدة القياس|Unità di misura|Abrechnungseinheit|계산 단위
Unit Price|単価|Цена за единицу|سعر الوحدة|Prezzo unitario|Einzelpreis|단가
Currency|通貨|Валюта|العملة|Valuta|Währung|통화
Total Amount|合計金額|Общая сумма|المبلغ الإجمالي|Importo totale|Gesamtbetrag|총액
Total|合計|Итого|الإجمالي|Totale|Gesamt|합계
Remark|備考|Примечание|ملاحظة|Nota|Anmerkung|비고
Image|画像|Изображение|الصورة|Immagine|Bild|이미지
Product Image|商品画像|Фото товара|صورة المنتج|Immagine prodotto|Produktbild|상품 이미지
Product Photos|商品写真|Фотографии товара|صور المنتجات|Foto dei prodotti|Produktfotos|상품 사진
Specification|仕様|Характеристики|المواصفات|Specifiche|Spezifikationen|규격
Configuration|構成|Комплектация|التجهيزات|Configurazione|Ausstattung|구성
Engine|エンジン|Двигатель|المحرك|Motore|Motor|엔진
Dimensions|寸法|Габариты|الأبعاد|Dimensioni|Abmessungen|치수
Terms|取引条件|Условия|الشروط|Condizioni|Bedingungen|거래 조건
Payment and Delivery Terms|支払・納入条件|Условия оплаты и поставки|شروط الدفع والتسليم|Condizioni di pagamento e consegna|Zahlungs- und Lieferbedingungen|결제 및 인도 조건
Payment Terms|支払条件|Условия оплаты|شروط الدفع|Condizioni di pagamento|Zahlungsbedingungen|결제 조건
Payment Method|支払方法|Способ оплаты|طريقة الدفع|Metodo di pagamento|Zahlungsart|결제 방법
Payment Ratio|支払比率|График оплаты|نسبة الدفع|Modalità di pagamento|Zahlungsaufteilung|결제 비율
Delivery Time|納期|Срок поставки|مدة التسليم|Tempi di consegna|Lieferzeit|납기
Trade Term|貿易条件|Условие поставки|شرط التجارة|Resa commerciale|Lieferklausel|무역 조건
Origin Port|船積港|Порт погрузки|ميناء الشحن|Porto di carico|Verladehafen|선적항
Destination Port|仕向港|Порт назначения|ميناء الوصول|Porto di destinazione|Bestimmungshafen|도착항
After-sales|アフターサービス|Послепродажное обслуживание|خدمة ما بعد البيع|Assistenza post-vendita|Kundendienst|사후 서비스
Warranty|保証|Гарантия|الضمان|Garanzia|Garantie|보증
Notes|備考|Примечания|ملاحظات|Note|Hinweise|비고
Bank Payment Information|銀行振込情報|Банковские реквизиты|بيانات الدفع البنكية|Coordinate bancarie|Bankverbindung|은행 송금 정보
Account Number|口座番号|Номер счёта|رقم الحساب|Numero conto|Kontonummer|계좌번호
Account Name|口座名義|Владелец счёта|اسم الحساب|Intestatario conto|Kontoinhaber|예금주
Bank Name|銀行名|Название банка|اسم البنك|Nome banca|Bankname|은행명
SWIFT/BIC Code|SWIFT/BICコード|Код SWIFT/BIC|رمز SWIFT/BIC|Codice SWIFT/BIC|SWIFT/BIC-Code|SWIFT/BIC 코드
Branch Code|支店コード|Код отделения|رمز الفرع|Codice filiale|Filialcode|지점 코드
Bank Address|銀行住所|Адрес банка|عنوان البنك|Indirizzo banca|Bankanschrift|은행 주소
Country/Region|国・地域|Страна / регион|الدولة / المنطقة|Paese / regione|Land / Region|국가/지역
Account Type|口座種別|Тип счёта|نوع الحساب|Tipo di conto|Kontoart|계좌 유형
Payment Method Notes|支払方法備考|Примечания к оплате|ملاحظات طريقة الدفع|Note sul pagamento|Hinweise zur Zahlung|결제 방법 안내
Quotation Contact|営業担当者|Контакт по предложению|مسؤول العرض|Referente commerciale|Angebotskontakt|견적 담당자
Company Stamp|社印|Печать компании|ختم الشركة|Timbro aziendale|Firmenstempel|회사 직인
Electronic Signature|電子署名|Электронная подпись|التوقيع الإلكتروني|Firma elettronica|Elektronische Unterschrift|전자서명
For and on behalf of the Seller|売主を代表して|От имени продавца|نيابة عن البائع|Per conto del venditore|Für und im Namen des Verkäufers|판매자를 대리하여
Authorized Signatory|署名権者|Уполномоченный подписант|المفوّض بالتوقيع|Firmatario autorizzato|Zeichnungsberechtigter|서명 권한자
Title|役職|Должность|المنصب|Qualifica|Funktion|직책
Buyer signature|買主署名|Подпись покупателя|توقيع المشتري|Firma dell'acquirente|Unterschrift des Käufers|구매자 서명
Signature|署名|Подпись|التوقيع|Firma|Unterschrift|서명
Shipment details|出荷情報|Сведения об отгрузке|تفاصيل الشحنة|Dati di spedizione|Versanddaten|선적 정보
Invoice reference|関連インボイス番号|Ссылка на инвойс|مرجع الفاتورة|Riferimento fattura|Rechnungsreferenz|관련 송장번호
Shipment date|出荷日|Дата отгрузки|تاريخ الشحن|Data spedizione|Versanddatum|출하일
Named place|指定場所|Указанное место|المكان المحدد|Luogo convenuto|Benannter Ort|지정 장소
Transport mode|輸送方法|Вид транспорта|وسيلة النقل|Modalità di trasporto|Transportart|운송 방식
Vessel / voyage|船名・航海番号|Судно / рейс|السفينة / الرحلة|Nave / viaggio|Schiff / Reise|선명/항차
B/L / AWB No.|船荷証券・航空運送状番号|Номер коносамента / авианакладной|رقم سند الشحن|N. polizza di carico / lettera di vettura aerea|Konnossement-/Luftfrachtbriefnummer|선하증권/항공운송장 번호
Container / seal No.|コンテナ・封印番号|Номер контейнера / пломбы|رقم الحاوية / الختم|N. container / sigillo|Container-/Plombennummer|컨테이너/봉인 번호
Country of origin|原産国|Страна происхождения|بلد المنشأ|Paese di origine|Ursprungsland|원산지
Shipment remarks|出荷備考|Примечания к отгрузке|ملاحظات الشحن|Note di spedizione|Versandhinweise|선적 비고
Payment instructions|支払案内|Порядок оплаты|تعليمات الدفع|Istruzioni di pagamento|Zahlungshinweise|결제 안내
Delivery and conditions|納入・取引条件|Поставка и условия|التسليم والشروط|Consegna e condizioni|Lieferung und Bedingungen|인도 및 조건
Goods and contract value|商品・契約金額|Товары и стоимость договора|البضائع وقيمة العقد|Merci e valore del contratto|Waren und Vertragswert|물품 및 계약금액
Packages|梱包数|Количество мест|عدد الطرود|Colli|Packstücke|포장 수
Net Weight (kg)|正味重量（kg）|Масса нетто (кг)|الوزن الصافي (كغ)|Peso netto (kg)|Nettogewicht (kg)|순중량(kg)
Gross Weight (kg)|総重量（kg）|Масса брутто (кг)|الوزن الإجمالي (كغ)|Peso lordo (kg)|Bruttogewicht (kg)|총중량(kg)
Volume (m³)|容積（m³）|Объём (м³)|الحجم (م³)|Volume (m³)|Volumen (m³)|부피(m³)
Shipping Marks|荷印|Маркировка|علامات الشحن|Marcature|Versandmarkierungen|화인
Pending quotation|見積待ち|Цена уточняется|بانتظار التسعير|Prezzo da confermare|Preis auf Anfrage|가격 미정
Priced items subtotal|価格確定項目の小計|Подытог оценённых позиций|المجموع الفرعي للبنود المسعّرة|Subtotale voci quotate|Zwischensumme bepreister Positionen|가격 확정 항목 소계
Equipment|設備|Оборудование|المعدات|Attrezzatura|Ausrüstung|장비
Sea freight|海上運賃|Морской фрахт|الشحن البحري|Nolo marittimo|Seefracht|해상운임
Inland transport|国内輸送費|Внутренняя перевозка|النقل الداخلي|Trasporto interno|Inlandtransport|내륙운송비
Port and customs clearance charges|港湾・通関費|Портовые и таможенные сборы|رسوم الميناء والتخليص الجمركي|Spese portuali e doganali|Hafen- und Zollabfertigungskosten|항만 및 통관 비용
Insurance|保険料|Страхование|التأمين|Assicurazione|Versicherung|보험료
Other charges|その他費用|Прочие расходы|رسوم أخرى|Altre spese|Sonstige Kosten|기타 비용
Disassembly and assembly charges|分解・組立費|Разборка и сборка|رسوم الفك والتركيب|Spese di smontaggio e montaggio|Demontage- und Montagekosten|분해 및 조립 비용
Used|中古|Бывшее в употреблении|مستعمل|Usato|Gebraucht|중고
Brand New & Unused|新品未使用|Новое, не использовалось|جديد وغير مستعمل|Nuovo e inutilizzato|Fabrikneu und unbenutzt|신품 미사용
Unit|台|Ед.|وحدة|Unità|Stück|대
Ton|トン|Тонна|طن|Tonnellata|Tonne|톤
Container|コンテナ|Контейнер|حاوية|Container|Container|컨테이너
Item|項目|Позиция|بند|Voce|Position|항목
Additional Information|追加情報|Дополнительные сведения|معلومات إضافية|Informazioni aggiuntive|Zusätzliche Informationen|추가 정보
Related order|関連注文|Связанный заказ|الطلب المرتبط|Ordine collegato|Zugehöriger Auftrag|관련 주문
Visitor Information|来訪者情報|Данные посетителя|معلومات الزائر|Dati del visitatore|Besucherinformationen|방문자 정보
Name|氏名|Имя|الاسم|Nome|Name|성명
Gender|性別|Пол|الجنس|Sesso|Geschlecht|성별
Date of Birth|生年月日|Дата рождения|تاريخ الميلاد|Data di nascita|Geburtsdatum|생년월일
Passport No.|旅券番号|Номер паспорта|رقم جواز السفر|N. passaporto|Passnummer|여권번호
Arrival Date in China|中国入国日|Дата прибытия в Китай|تاريخ الوصول إلى الصين|Data di arrivo in Cina|Einreise nach China|중국 입국일
Departure Date from China|中国出国日|Дата выезда из Китая|تاريخ مغادرة الصين|Data di partenza dalla Cina|Ausreise aus China|중국 출국일
Place to Visit|訪問先|Место посещения|مكان الزيارة|Luogo della visita|Besuchsort|방문 장소
Visa Type|査証種別|Тип визы|نوع التأشيرة|Tipo di visto|Visumart|비자 유형
Relationship|双方の関係|Характер отношений|العلاقة|Rapporto|Geschäftsbeziehung|상호 관계
Source of Expenses|費用負担者|Источник финансирования|الجهة المتحملة للنفقات|Copertura delle spese|Kostenübernahme|비용 부담
Purpose of Visit|訪問目的|Цель визита|غرض الزيارة|Scopo della visita|Besuchszweck|방문 목적
Additional Notes|補足事項|Дополнительные примечания|ملاحظات إضافية|Note aggiuntive|Ergänzende Hinweise|추가 비고
Responsibility Statement|責任声明|Заявление об ответственности|بيان المسؤولية|Dichiarazione di responsabilità|Verantwortlichkeitserklärung|책임 명시
Inviter|招聘者|Приглашающее лицо|الداعي|Invitante|Einladende Person|초청인
Authorized Signature|正式署名|Подпись уполномоченного лица|التوقيع المعتمد|Firma autorizzata|Autorisierte Unterschrift|권한자 서명
To|宛先|Кому|إلى|A|An|수신
Territory|対象国・地域|Территория|النطاق الجغرافي|Territorio|Gebiet|위임 국가/지역
Representative|代理人|Представитель|الممثل|Rappresentante|Vertreter|대리인
ID / Passport No.|身分証・旅券番号|Номер удостоверения / паспорта|رقم الهوية / جواز السفر|N. documento / passaporto|Ausweis-/Passnummer|신분증/여권번호
Telephone|電話|Телефон|الهاتف|Telefono|Telefon|전화
Contact Address|連絡先住所|Контактный адрес|عنوان الاتصال|Indirizzo di contatto|Kontaktanschrift|연락처 주소
Terms of Authorization|授権条件|Условия полномочий|شروط التفويض|Condizioni di autorizzazione|Vollmachtsbedingungen|위임 조건
Authorized Product Scope|対象製品|Разрешённые товары|نطاق المنتجات المصرح بها|Prodotti autorizzati|Autorisierte Produkte|판매 위임 제품 범위
Additional Terms|追加条件|Дополнительные условия|شروط إضافية|Condizioni aggiuntive|Zusätzliche Bedingungen|추가 조건
Authorizing Party|授権者|Доверитель|الجهة المفوّضة|Parte autorizzante|Vollmachtgeber|위임자
Date of Issue|発行日|Дата выдачи|تاريخ الإصدار|Data di emissione|Ausstellungsdatum|발급일`;
  const labels={};for(const line of rows.split('\n')){const [key,...values]=line.split('|');if(values.length!==extra.length)throw Error('Invalid locale row: '+key);labels[key]=Object.fromEntries(extra.map((lang,i)=>[lang,values[i]]));}
  const aliases={Qty:'Quantity',Amount:'Total Amount','HS Code':'HS CODE','HS code':'HS CODE','Company Seal':'Company Stamp','Product Image':'Image','Port of Loading':'Origin Port','Port of Discharge':'Destination Port','Mode of Transport':'Transport mode','Shipping Method':'Transport mode','Payment and Shipping Terms':'Payment and Delivery Terms','Phone / WhatsApp':'Phone','Brand New':'Brand New & Unused','Condition':'Used','Quotation Validity':'Valid Until','Total CBM':'Volume (m³)','Total Net Weight':'Net Weight (kg)','Total Gross Weight':'Gross Weight (kg)','Total Packages':'Packages','Product Type':'Item Type'};
  delete aliases.Condition;
  // Fixed headings missing from the older French/Spanish packs; never replace user text.
  const latinRows=`Proforma Invoice Items|Articles de la facture pro forma|Artículos de la factura proforma
Contract Items|Articles du contrat|Artículos del contrato
Invoice Items|Articles de la facture|Artículos de la factura
Packing Items|Détail du colisage|Detalle del embalaje
Payment and Delivery Terms|Conditions de paiement et de livraison|Condiciones de pago y entrega
Brand|Marque|Marca
Model|Modèle|Modelo
Year|Année|Año
Working Hours|Heures de fonctionnement|Horas de trabajo
Condition|État|Estado
Image|Image|Imagen
Specification|Caractéristiques|Especificaciones
Configuration|Configuration|Configuración
Dimensions|Dimensions|Dimensiones
Engine|Moteur|Motor
Billing Unit|Unité de facturation|Unidad de facturación
Currency|Devise|Moneda
Total Amount|Montant total|Importe total
Payment Method|Mode de paiement|Método de pago
Payment Ratio|Échéancier de paiement|Proporción de pago
Deposit|Acompte|Anticipo
Balance before shipment|Solde avant expédition|Saldo antes del envío
Payment before shipment|Paiement avant expédition|Pago antes del envío
Country of origin|Pays d’origine|País de origen
Shipment details|Détails de l’expédition|Detalles del envío
Invoice reference|Référence de facture|Referencia de factura
Shipment date|Date d’expédition|Fecha de envío
Named place|Lieu convenu|Lugar convenido
Transport mode|Mode de transport|Modo de transporte
Vessel / voyage|Navire / voyage|Buque / viaje
B/L / AWB No.|N° de connaissement / LTA|N.º de conocimiento / guía aérea
Container / seal No.|N° de conteneur / scellé|N.º de contenedor / precinto
Shipment remarks|Observations d’expédition|Observaciones del envío
Payment instructions|Instructions de paiement|Instrucciones de pago
Delivery and conditions|Livraison et conditions|Entrega y condiciones
Goods and contract value|Marchandises et montant du contrat|Mercancías y valor del contrato
Packages|Colis|Bultos
Net Weight (kg)|Poids net (kg)|Peso neto (kg)
Gross Weight (kg)|Poids brut (kg)|Peso bruto (kg)
Volume (m³)|Volume (m³)|Volumen (m³)
Shipping Marks|Marques d’expédition|Marcas de envío
Priced items subtotal|Sous-total des articles chiffrés|Subtotal de artículos cotizados
For and on behalf of the Seller|Pour le compte du vendeur|Por y en nombre del vendedor
Authorized Signatory|Signataire autorisé|Firmante autorizado
Buyer signature|Signature de l’acheteur|Firma del comprador
Additional Information|Informations complémentaires|Información adicional
Related order|Commande associée|Pedido relacionado
Commission and Settlement|Commission et règlement|Comisión y liquidación`;
  for(const row of latinRows.split('\n')){const [key,fr,es]=row.split('|');labels[key]={...labels[key],fr,es};}
  const special={
    'Pro forma invoice — not a final commercial invoice.':['プロフォーマインボイス（最終商業送り状ではありません）。','Проформа-инвойс — не окончательный коммерческий инвойс.','فاتورة أولية — ليست فاتورة تجارية نهائية.','Fattura proforma — non costituisce fattura commerciale definitiva.','Proformarechnung — keine endgültige Handelsrechnung.','견적송장 — 최종 상업송장이 아닙니다.'],
    'No electronic signature configured':['電子署名が設定されていません','Электронная подпись не настроена','لم يتم إعداد توقيع إلكتروني','Firma elettronica non configurata','Keine elektronische Unterschrift eingerichtet','전자서명이 설정되지 않았습니다'],
    'Incomplete quotation: prices are required before formal issue.':['正式発行前に価格を入力してください。','До официального выпуска необходимо указать цены.','يجب إكمال الأسعار قبل الإصدار الرسمي.','Completare i prezzi prima dell’emissione ufficiale.','Vor der offiziellen Ausstellung müssen die Preise ergänzt werden.','정식 발행 전에 가격을 입력하십시오.'],
    'Draft quotation: some items are pending pricing and excluded from the subtotal.':['見積草稿：未確定価格の項目は小計に含まれません。','Черновик: позиции без цены не включены в подытог.','مسودة: البنود غير المسعّرة غير مشمولة في المجموع الفرعي.','Bozza: le voci senza prezzo sono escluse dal subtotale.','Entwurf: Positionen ohne Preis sind nicht in der Zwischensumme enthalten.','견적 초안: 가격 미정 항목은 소계에서 제외됩니다.']
  };
  Object.entries(special).forEach(([key,values])=>labels[key]=Object.fromEntries(extra.map((lang,i)=>[lang,values[i]])));
  const keyIndex=Object.fromEntries(Object.keys(labels).map(key=>[key.toLowerCase(),key]));
  function label(en,mode){const key=aliases[en]||keyIndex[String(en||'').toLowerCase()]||en;return labels[key]?.[mode]||'';}
  const supported=new Set([...Object.keys(languages),'zh','bilingual','zh-en','zh-es','zh-fr']);
  function options(){return [['bilingual','中英双语'],['zh','中文'],...Object.entries(languages),['zh-es','中西双语'],['zh-fr','中法双语']].map(([value,labelZh],i)=>({id:'language:'+value,value,labelZh,labelEn:value,active:true,sortOrder:(i+1)*10}));}
  function mergeOptions(existing=[]){const result=existing.map(o=>({...o}));for(const option of options())if(!result.some(o=>o.value===option.value))result.push({...option,sortOrder:Math.max(0,...result.map(o=>Number(o.sortOrder)||0))+10});return result;}
  function apply(host,mode){if(!host)return;host.lang=supported.has(mode)&&languages[mode]?mode:mode==='zh'?'zh-CN':'en';host.dir=mode==='ar'?'rtl':'ltr';host.dataset.templateLocaleVersion=String(version);host.classList.toggle('document-rtl',mode==='ar');}
  if(typeof document!=='undefined')for(const id of ['pdf-language','invitation-language','agency-language']){const select=document.getElementById(id);if(select)for(const option of options())if(![...select.options].some(o=>o.value===option.value))select.add(new Option(option.labelZh,option.value));}
  return {version,languages,extra,labels,label,supported,options,mergeOptions,apply};
});
