(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DocumentTemplateCopy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // These are fixed, reviewed-by-user-editable template strings, not machine translation.
  const packs={
    fr:{payment:'Conditions de paiement et de transport : après réception de l’acompte de 30 %, nous préparons la déclaration en douane à l’exportation et les documents nécessaires, nettoyons le matériel et réalisons l’inspection avant livraison (PDI). Nous réservons ensuite l’espace maritime et coordonnons le transport au port par remorque surbaissée. Le solde de 70 % doit être intégralement payé avant le chargement sur le navire. Veuillez saisir exactement la dénomination légale complète de la société bénéficiaire. L’adresse bancaire doit être Hong Kong, Chine. Vérifiez le code BIC/SWIFT avec nos coordonnées bancaires officielles. Des renseignements erronés ou incomplets peuvent entraîner le rejet ou le retard du virement.'},
    es:{payment:'Condiciones de pago y transporte: tras recibir el anticipo del 30%, prepararemos la declaración aduanera de exportación y los documentos necesarios, limpiaremos el equipo y completaremos la inspección previa a la entrega (PDI). Después reservaremos espacio marítimo y coordinaremos el transporte al puerto en remolque de plataforma baja. El saldo del 70% deberá pagarse íntegramente antes de cargar el equipo en el buque. Indique de forma exacta y completa la razón social del beneficiario. La dirección bancaria debe ser Hong Kong, China. Verifique el código BIC/SWIFT con nuestros datos bancarios oficiales. Los datos erróneos o incompletos pueden causar el rechazo o retraso de la transferencia.'},
    ja:{
      invite:'当社は、{company}を代表する{country}の{name}様を{place}に招聘し、商談、工場見学、機械検査および購入協議を行います。入国予定日は{arrival}、出国予定日は{departure}です。',
      closing:'本訪問の査証申請について、必要なご支援を賜りますようお願い申し上げます。',
      responsibility:'訪中に伴う国際・国内交通費、宿泊費、食費、保険料、医療費および個人的支出を含むすべての費用は、来訪者／顧客が負担します。滞在期限超過、出国遅延、現地法令違反または個人の行為による罰金、損失、処分および法的責任は来訪者／顧客のみが負担し、当社はこれらの費用および責任を負いません。',
      appoint:'当社は、{name}を{country}における非独占的販売代理人として選任します。',
      authorization:[
        '代理人は、対象地域内で、下記「対象製品」に記載された製品のみを宣伝・販売できます。',
        '代理人は商談と顧客要望の伝達を行えますが、当社名義で契約を締結し、代金を受領し、または法的拘束力のある約束を行う権限はありません。契約および最終見積は授権者が発行または確認しなければなりません。',
        '代理人は対象地域の法令、許認可、税務、広告、制裁および腐敗防止の要件を遵守し、自らの行為による違反について責任を負います。',
        '代理人は誠実に営業し、製品を正確に説明し、営業秘密および顧客情報を保護します。虚偽の約束、商標の不正使用、当社の信用・利益を損なう行為は禁止します。'
      ],
      extra:'本授権は非独占的であり、再授権できません。授権者は書面通知により範囲を変更し、または早期終了できます。代理人は授権者名義で口座開設、借入、保証、あるいは本授権を超える約束を行うことはできません。',
      effect:'本授権は署名・押印の日に発効します。',
      payment:'支払・輸送条件：30%の前払金受領後、当社は輸出通関・必要書類の準備、機械の清掃および出荷前検査（PDI）を行い、その後船腹を予約し、港までの低床トレーラー輸送を手配します。船積み前に残金70%を全額お支払いください。送金時は受取会社の正式名称を正確かつ完全に記入し、銀行住所は中国香港としてください。正式な銀行情報のBIC/SWIFTコードを必ず照合してください。送金情報に誤りや不足があると、拒否または遅延の原因となります。'
    },
    ru:{
      invite:'Приглашаем {name} из {country}, представляющего компанию {company}, посетить {place} для деловой встречи, посещения завода, осмотра техники и обсуждения закупки. Планируемая дата въезда: {arrival}; дата выезда: {departure}.',
      closing:'Просим оказать необходимое содействие в оформлении визы для этой деловой поездки в Китай.',
      responsibility:'Все расходы во время визита в Китай, включая международный и внутренний транспорт, проживание, питание, страхование, медицинские и личные расходы, несёт посетитель/клиент. Штрафы, убытки, санкции и юридическая ответственность за превышение срока пребывания, задержку выезда, нарушение местных законов или личные действия возлагаются исключительно на посетителя/клиента. Наша компания не несёт таких расходов и ответственности.',
      appoint:'Настоящим назначаем {name} нашим неэксклюзивным торговым представителем на территории {country}.',
      authorization:[
        'Представитель вправе продвигать и продавать на указанной территории только товары, перечисленные ниже в разделе «Разрешённые товары».',
        'Представитель вправе вести переговоры и передавать требования клиентов, но не вправе подписывать договоры, получать платежи или принимать юридически обязательные обязательства от нашего имени. Все договоры и окончательные предложения должны быть выданы или подтверждены доверителем.',
        'Представитель обязан соблюдать применимые законы и требования в области лицензирования, налогов, рекламы, санкций и противодействия коррупции и отвечает за нарушения, вызванные его собственными действиями.',
        'Представитель обязан действовать добросовестно, точно описывать товары, защищать коммерческую тайну и данные клиентов; ложные обещания, злоупотребление товарными знаками и ущерб нашей репутации или интересам запрещены.'
      ],
      extra:'Полномочия неэксклюзивны и не подлежат передаче. Доверитель может изменить их объём или досрочно прекратить их письменным уведомлением. Представитель не вправе открывать счета, занимать средства, предоставлять гарантии или принимать обязательства сверх настоящих полномочий от имени доверителя.',
      effect:'Полномочия вступают в силу с даты подписания и проставления печати.',
      payment:'Условия оплаты и перевозки: после получения аванса 30% мы оформим экспортную таможенную декларацию и необходимые документы, очистим технику и проведём предпродажную инспекцию (PDI). Затем забронируем место на судне и организуем доставку низкорамным тралом в порт. Остаток 70% должен быть полностью оплачен до погрузки на судно. При переводе укажите полное юридическое наименование компании-получателя без ошибок. Адрес банка: Гонконг, Китай. Сверьте код BIC/SWIFT с нашими официальными реквизитами. Неполные или неверные данные могут привести к отклонению или задержке перевода.'
    },
    ar:{
      invite:'ندعو {name} من {country}، ممثلاً لشركة {company}، لزيارة {place} لإجراء مباحثات تجارية وزيارة المصنع وفحص الآلات ومناقشة الشراء. تاريخ الوصول المخطط هو {arrival} وتاريخ المغادرة المخطط هو {departure}.',
      closing:'نرجو تقديم المساعدة اللازمة في إجراءات التأشيرة لهذه الزيارة التجارية إلى الصين.',
      responsibility:'يتحمل الزائر/العميل جميع نفقات الزيارة إلى الصين، بما فيها النقل الدولي والمحلي والإقامة والوجبات والتأمين والعلاج والنفقات الشخصية. كما يتحمل وحده أي غرامات أو خسائر أو عقوبات أو مسؤوليات قانونية ناتجة عن تجاوز مدة الإقامة أو تأخير المغادرة أو مخالفة القوانين المحلية أو التصرفات الشخصية. ولا تتحمل شركتنا أياً من هذه النفقات أو المسؤوليات.',
      appoint:'نفوّض بموجب هذا {name} ليكون ممثل مبيعات غير حصري لنا في {country}.',
      authorization:[
        'يجوز للممثل الترويج وبيع المنتجات المدرجة أدناه ضمن نطاق المنتجات المصرح بها فقط داخل النطاق الجغرافي المحدد.',
        'يجوز للممثل إجراء المفاوضات ونقل متطلبات العملاء، ولا يجوز له توقيع العقود أو تحصيل المدفوعات أو تقديم التزامات ملزمة قانوناً باسمنا. ويجب أن تصدر الجهة المفوّضة جميع العقود والعروض النهائية أو تؤكدها.',
        'يلتزم الممثل بالقوانين ومتطلبات التراخيص والضرائب والإعلانات والعقوبات ومكافحة الفساد السارية، ويتحمل المسؤولية عن المخالفات الناشئة عن تصرفاته.',
        'يلتزم الممثل بالأمانة ودقة وصف المنتجات وحماية الأسرار التجارية وبيانات العملاء، ويحظر تقديم وعود كاذبة أو إساءة استخدام علاماتنا التجارية أو الإضرار بسمعتنا ومصالحنا.'
      ],
      extra:'هذا التفويض غير حصري وغير قابل للتفويض للغير. ويجوز للجهة المفوّضة تعديل نطاقه أو إنهاؤه مبكراً بإشعار كتابي. ولا يجوز للممثل فتح حسابات أو الاقتراض أو تقديم ضمانات أو التزامات تتجاوز هذا التفويض باسم الجهة المفوّضة.',
      effect:'يسري هذا التفويض من تاريخ التوقيع والختم.',
      payment:'شروط الدفع والشحن: بعد استلام دفعة مقدمة بنسبة 30%، سننجز البيان الجمركي للتصدير والمستندات المطلوبة وتنظيف المعدات وفحص ما قبل التسليم (PDI)، ثم نحجز مساحة الشحن وننسق نقل المعدات بمقطورة منخفضة إلى الميناء. يجب سداد الرصيد المتبقي 70% بالكامل قبل تحميل المعدات على السفينة. يرجى إدخال الاسم القانوني الكامل للشركة المستفيدة بدقة، وكتابة عنوان البنك: هونغ كونغ، الصين. يجب التحقق من رمز BIC/SWIFT وفق بياناتنا البنكية الرسمية. قد تتسبب البيانات الخاطئة أو الناقصة في رفض التحويل أو تأخيره.'
    },
    it:{
      invite:'Invitiamo {name}, proveniente da {country} e rappresentante di {company}, a visitare {place} per incontri commerciali, visita dello stabilimento, ispezione dei macchinari e trattative di acquisto. L’ingresso è previsto il {arrival} e la partenza il {departure}.',
      closing:'Chiediamo cortesemente l’assistenza necessaria per il visto relativo a questa visita commerciale in Cina.',
      responsibility:'Tutte le spese della visita in Cina, inclusi trasporti internazionali e interni, alloggio, pasti, assicurazione, cure mediche e spese personali, sono a carico del visitatore/cliente. Multe, perdite, sanzioni e responsabilità legali derivanti da soggiorno oltre il termine, ritardata partenza, violazioni delle leggi locali o condotta personale restano esclusivamente a suo carico. La nostra società non sostiene tali costi o responsabilità.',
      appoint:'Nominiamo {name} nostro rappresentante commerciale non esclusivo in {country}.',
      authorization:[
        'Il rappresentante può promuovere e vendere nel territorio soltanto i prodotti elencati nella sezione Prodotti autorizzati qui sotto.',
        'Il rappresentante può svolgere trattative e trasmettere le richieste dei clienti, ma non può firmare contratti, riscuotere pagamenti o assumere impegni vincolanti a nostro nome. Tutti i contratti e i preventivi finali devono essere emessi o confermati dalla parte autorizzante.',
        'Il rappresentante deve rispettare tutte le leggi e le prescrizioni applicabili in materia di licenze, imposte, pubblicità, sanzioni e anticorruzione e risponde delle violazioni derivanti dalla propria condotta.',
        'Il rappresentante deve agire con onestà, descrivere accuratamente i prodotti e tutelare i segreti commerciali e i dati dei clienti. Sono vietati false promesse, uso improprio dei marchi e danni alla nostra reputazione o ai nostri interessi.'
      ],
      extra:'L’autorizzazione è non esclusiva e non trasferibile. La parte autorizzante può modificarne l’ambito o revocarla anticipatamente mediante comunicazione scritta. Il rappresentante non può aprire conti, contrarre prestiti, offrire garanzie o assumere impegni oltre la presente autorizzazione a nome della parte autorizzante.',
      effect:'La presente autorizzazione entra in vigore alla data della firma e del timbro.',
      payment:'Condizioni di pagamento e spedizione: ricevuto l’acconto del 30%, prepareremo la dichiarazione doganale e i documenti di esportazione, puliremo le attrezzature e completeremo l’ispezione preconsegna (PDI). Prenoteremo quindi lo spazio nave e coordineremo il trasporto al porto con rimorchio ribassato. Il saldo del 70% deve essere pagato integralmente prima del carico sulla nave. Indicare correttamente la denominazione legale completa della società beneficiaria e, come indirizzo bancario, Hong Kong, Cina. Verificare il codice BIC/SWIFT con le nostre coordinate ufficiali. Dati errati o incompleti possono causare rifiuti o ritardi nel bonifico.'
    },
    de:{
      invite:'Wir laden {name} aus {country}, als Vertreter von {company}, zu einem Besuch bei {place} ein, um Geschäftsgespräche, einen Werksbesuch, Maschinenbesichtigungen und Kaufverhandlungen durchzuführen. Die Einreise ist für den {arrival} und die Ausreise für den {departure} vorgesehen.',
      closing:'Wir bitten um die erforderliche Unterstützung beim Visumantrag für diese Geschäftsreise nach China.',
      responsibility:'Sämtliche Kosten des China-Aufenthalts, einschließlich internationaler und inländischer Beförderung, Unterkunft, Verpflegung, Versicherung, medizinischer und persönlicher Ausgaben, trägt der Besucher/Kunde. Geldbußen, Verluste, Sanktionen und rechtliche Folgen aufgrund einer Überschreitung der Aufenthaltsdauer, verspäteter Ausreise, Verletzung örtlicher Gesetze oder persönlichen Verhaltens trägt ausschließlich der Besucher/Kunde. Unser Unternehmen übernimmt hierfür weder Kosten noch Haftung.',
      appoint:'Hiermit bestellen wir {name} zu unserem nicht ausschließlichen Handelsvertreter in {country}.',
      authorization:[
        'Der Vertreter darf im genannten Gebiet ausschließlich die unten unter Autorisierte Produkte aufgeführten Waren bewerben und verkaufen.',
        'Der Vertreter darf Verhandlungen führen und Kundenanforderungen weiterleiten, jedoch keine Verträge unterzeichnen, Zahlungen entgegennehmen oder rechtsverbindliche Zusagen in unserem Namen abgeben. Alle Verträge und endgültigen Angebote müssen vom Vollmachtgeber ausgestellt oder bestätigt werden.',
        'Der Vertreter hat alle geltenden gesetzlichen, genehmigungsrechtlichen, steuerlichen, werbe-, sanktions- und korruptionsrechtlichen Anforderungen einzuhalten und haftet für Verstöße aufgrund seines eigenen Verhaltens.',
        'Der Vertreter muss redlich handeln, Produkte zutreffend beschreiben und Geschäftsgeheimnisse sowie Kundendaten schützen. Falsche Versprechen, Markenmissbrauch und Handlungen zulasten unseres Rufs oder unserer Interessen sind untersagt.'
      ],
      extra:'Diese Vollmacht ist nicht ausschließlich und nicht übertragbar. Der Vollmachtgeber kann ihren Umfang schriftlich ändern oder sie vorzeitig beenden. Der Vertreter darf im Namen des Vollmachtgebers keine Konten eröffnen, Darlehen aufnehmen, Bürgschaften stellen oder über diese Vollmacht hinausgehende Zusagen machen.',
      effect:'Diese Vollmacht tritt am Tag der Unterzeichnung und Abstempelung in Kraft.',
      payment:'Zahlungs- und Versandbedingungen: Nach Eingang der Anzahlung von 30% erledigen wir die Ausfuhrzollanmeldung und erforderlichen Dokumente, reinigen die Maschine und führen die Vorabnahme (PDI) durch. Anschließend buchen wir Schiffsraum und koordinieren den Tiefladertransport zum Hafen. Die restlichen 70% sind vor der Verladung auf das Schiff vollständig zu zahlen. Bitte geben Sie den vollständigen rechtlichen Namen des begünstigten Unternehmens korrekt ein. Als Bankadresse ist Hongkong, China, anzugeben. Gleichen Sie den BIC/SWIFT-Code mit unseren offiziellen Bankdaten ab. Fehlerhafte oder unvollständige Angaben können zur Ablehnung oder Verzögerung der Überweisung führen.'
    },
    ko:{
      invite:'당사는 {country}의 {company}를 대표하는 {name} 님을 {place}에 초청하여 비즈니스 상담, 공장 방문, 장비 검사 및 구매 협의를 진행하고자 합니다. 입국 예정일은 {arrival}, 출국 예정일은 {departure}입니다.',
      closing:'이번 중국 비즈니스 방문을 위한 비자 발급에 필요한 협조를 부탁드립니다.',
      responsibility:'방중 기간의 국제 및 국내 교통비, 숙박비, 식비, 보험료, 의료비 및 개인 경비를 포함한 모든 비용은 방문자/고객이 부담합니다. 체류 기간 초과, 출국 지연, 현지 법규 위반 또는 개인 행위로 발생하는 벌금, 손실, 처벌 및 법적 책임은 전적으로 방문자/고객이 부담하며 당사는 해당 비용 및 책임을 부담하지 않습니다.',
      appoint:'당사는 {name} 님을 {country} 지역의 비독점 판매 대리인으로 위임합니다.',
      authorization:[
        '대리인은 지정 지역 내에서 아래 판매 위임 제품 범위에 기재된 제품만 홍보하고 판매할 수 있습니다.',
        '대리인은 비즈니스 협의 및 고객 요구사항 전달은 할 수 있으나 당사 명의로 계약 서명, 대금 수령 또는 법적 구속력이 있는 약속을 할 수 없습니다. 모든 계약과 최종 견적은 위임자가 발행하거나 확인해야 합니다.',
        '대리인은 해당 지역의 법률, 인허가, 세금, 광고, 제재 및 부패방지 요건을 준수해야 하며 자신의 행위로 인한 위반에 책임을 집니다.',
        '대리인은 정직하게 영업하고 제품을 정확히 설명하며 영업비밀과 고객 정보를 보호해야 합니다. 허위 약속, 상표 오용, 당사의 명예 또는 이익을 해치는 행위는 금지됩니다.'
      ],
      extra:'본 위임은 비독점적이며 재위임할 수 없습니다. 위임자는 서면 통지로 범위를 변경하거나 조기 종료할 수 있습니다. 대리인은 위임자 명의의 계좌 개설, 차입, 보증 제공 또는 본 위임을 초과하는 약속을 할 수 없습니다.',
      effect:'본 위임장은 서명 및 날인한 날부터 효력이 발생합니다.',
      payment:'결제 및 운송 조건: 계약금 30% 수령 후 수출 신고와 필요 서류 준비, 장비 청소 및 인도 전 검사(PDI)를 완료합니다. 이후 선복을 예약하고 항구까지 저상 트레일러 운송을 조정합니다. 선박 적재 전 잔금 70%를 전액 결제해야 합니다. 송금 시 수취 회사의 법적 정식 명칭을 정확하고 빠짐없이 기재하고, 은행 주소는 중국 홍콩으로 기재하십시오. 공식 은행 정보의 BIC/SWIFT 코드를 확인하십시오. 잘못되거나 불완전한 정보는 송금 거절 또는 지연을 초래할 수 있습니다.'
    }
  };
  function get(lang,key,values={}){const template=packs[lang]?.[key];return typeof template==='string'?template.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??'')):template;}
  const authorizationSources=[
    'The representative may promote and sell only the products listed in the Authorized Product Scope below within the territory.',
    'The representative may conduct business discussions and submit customer requirements, but may not sign contracts, collect payments or make binding commitments in our name. All contracts and final quotations must be issued or confirmed by the authorizing party.',
    'The representative shall comply with all applicable laws, licensing, tax, advertising, sanctions and anti-corruption requirements in the territory and shall bear responsibility for violations arising from its own conduct.',
    'The representative shall act honestly, accurately describe products, protect confidential and customer information, and shall not make false promises, misuse our trademarks or damage our reputation.'
  ];
  function authorizationText(en,mode,a={}){if(!packs[mode]?.authorization)return '';if(en.startsWith('We hereby appoint '))return get(mode,'appoint',{name:a.agentName||'—',country:a.country||'—'});if(en==='This authorization becomes effective on the date of signature and seal.')return get(mode,'effect');const i=authorizationSources.indexOf(en);return i<0?'':packs[mode].authorization[i];}
  return {packs,get,authorizationText};
});
