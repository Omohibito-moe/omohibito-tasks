import type Database from 'better-sqlite3'

interface RawTask {
  b: string
  l: '大タスク' | '中タスク' | '小タスク'
  n: string
  a?: string
  d?: string
  notes?: string
}

const TASKS: RawTask[] = [
  // ── コンシェルジュ ──────────────────────────────────────
  { b: 'コンシェルジュ', l: '大タスク', n: '1. 需要のデジタル検証（Q1：4-6月）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '1-1：検索需要の定量化', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'Googleキーワードプランナーで新潟の施設探し関連KW調査', a: '金子', d: '4月第2週', notes: '半日で完了' },
  { b: 'コンシェルジュ', l: '小タスク', n: '同じKWを山形でも調査（山形展開の基礎データ）', a: '金子', d: '4月第2週', notes: '新潟と同日にやる' },
  { b: 'コンシェルジュ', l: '小タスク', n: '判定：ボリュームがほぼゼロなら新潟の地域選定を見直す', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '中タスク', n: '1-2：LP制作＋少額広告の実行', d: '5月末' },
  { b: 'コンシェルジュ', l: '小タスク', n: '「施設探し」特化のLP作成（ペライチ等で1日以内）', a: '金子', d: '4月中', notes: '訴求：1ヶ月で施設確保。通常20万円を初回無料相談' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'Google広告を新潟エリアに限定配信（予算5〜10万円）', a: '金子', d: '4月中〜5月', notes: '2〜4週間で判定' },
  { b: 'コンシェルジュ', l: '小タスク', n: '山形エリアでも同じLPの広告を少額で配信', a: '金子', d: '4月中〜5月', notes: '峯田氏オフラインルートとの比較材料' },
  { b: 'コンシェルジュ', l: '小タスク', n: '計測：表示回数、クリック率、相談申込数、申込者プロファイル', a: '金子', d: '5月末' },
  { b: 'コンシェルジュ', l: '中タスク', n: '1-3：検証結果の判定', d: '6月末' },
  { b: 'コンシェルジュ', l: '小タスク', n: '判定基準を事前に決定（0件/1-3件/4件以上で分岐）', a: '金子', d: '4月中', notes: 'LP公開前に決めておく' },
  { b: 'コンシェルジュ', l: '小タスク', n: '申込が来た場合、実際に相談対応→有料転換の可否を確認', a: '金子・山崎', d: '6月末' },

  { b: 'コンシェルジュ', l: '大タスク', n: '2. 士業ネットワーク構築＋最初の1件（Q1-Q3）', notes: '包括より士業が優先。村山・弥田経由で即着手可能' },
  { b: 'コンシェルジュ', l: '中タスク', n: '2-1：新潟の士業への接触', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '村山（司法書士）に新潟の司法書士・行政書士を紹介依頼', a: '金子', d: '4月中', notes: '取締役なので即動ける' },
  { b: 'コンシェルジュ', l: '小タスク', n: '弥田（湊相続コンシェル）経由で新潟の相続・不動産関連士業に接触', a: '金子', d: '4月中' },
  { b: 'コンシェルジュ', l: '小タスク', n: '士業への訴求：「施設探しや制度手続きで困っている方がいたら、最初の1件は無料で対応します」', a: '金子', d: '4月中', notes: '通常20万円を明示して価値認知を作る' },
  { b: 'コンシェルジュ', l: '小タスク', n: '士業の勉強会・交流会があれば顔を出す', a: '金子', d: '4-6月' },
  { b: 'コンシェルジュ', l: '中タスク', n: '2-2：士業経由の案件対応', d: '案件発生後' },
  { b: 'コンシェルジュ', l: '小タスク', n: '士業から紹介された案件を山崎マニュアルに沿って実行', a: '金子・山崎', d: '案件発生後', notes: '山崎リモート監修＋金子主担当' },
  { b: 'コンシェルジュ', l: '小タスク', n: '全件記録（所要時間、クロスセル発生有無、士業側の満足度）', a: '金子', d: '案件発生後' },
  { b: 'コンシェルジュ', l: '小タスク', n: '成功事例を士業にフィードバック→次の紹介を生む循環を作る', a: '金子', d: '案件発生後' },
  { b: 'コンシェルジュ', l: '中タスク', n: '2-3：士業との継続的な関係構築', d: '通年' },
  { b: 'コンシェルジュ', l: '小タスク', n: '紹介してくれた士業に四半期ごとに進捗報告', a: '金子', d: '四半期ごと' },
  { b: 'コンシェルジュ', l: '小タスク', n: '士業向けの1枚チラシ作成（何を・いくらで・どこまでやるか）', a: '金子', d: '4月中', notes: '山崎監修' },

  { b: 'コンシェルジュ', l: '大タスク', n: '3. 山形での需要検証（Q1-Q2：4-9月）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '3-1：峯田氏ネットワークとの接続', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '峯田氏にコンシェルジュ需要のヒアリング', a: '金子', d: '4月中' },
  { b: 'コンシェルジュ', l: '小タスク', n: '6月総会でのコンシェルジュ告知の準備', a: '金子', d: '5月中', notes: 'DX登壇と同一出張で処理' },
  { b: 'コンシェルジュ', l: '小タスク', n: '行政書士会連携協定（6月締結予定）からの紹介可能性を確認', a: '金子→峯田', d: '5月' },
  { b: 'コンシェルジュ', l: '中タスク', n: '3-2：6月総会での告知と反応計測', d: '6月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '6/19登壇時にDX研修＋コンシェルジュ施設探し代行を告知', a: '金子', d: '6/19', notes: '配布資料にコンシェルジュ案内を含める' },
  { b: 'コンシェルジュ', l: '小タスク', n: '反応（問い合わせ・紹介・相談）の件数を記録', a: '金子', d: '7月' },
  { b: 'コンシェルジュ', l: '中タスク', n: '3-3：ニッセイ財団の申請（5/29締切）', d: '5/29' },
  { b: 'コンシェルジュ', l: '小タスク', n: '峯田氏・手塚氏とZoom日程調整', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '小タスク', n: '申請内容の素案準備', a: '金子', d: '4月末', notes: 'テーマ3「市民コンシェルジュの養成」' },
  { b: 'コンシェルジュ', l: '小タスク', n: '申請書完成・提出', a: '金子', d: '5/29', notes: '最大400万円' },

  { b: 'コンシェルジュ', l: '大タスク', n: '4. コンシェルジュ複製の準備（Q2-Q3）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '4-1：マニュアルの施設探しパート抽出', d: '6月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '山崎300ページマニュアルから施設探し手順を抽出→汎用版作成', a: '山崎主導・金子構造化', d: '6月' },
  { b: 'コンシェルジュ', l: '中タスク', n: '4-2：相談対応フローの事前設計', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '相談→アセスメント→施設候補→見学→入居の各段階の役割分担を決定', a: '金子・山崎', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '記録項目の設計（所要時間、山崎介入回数、品質評価）', a: '金子', d: '5月' },

  { b: 'コンシェルジュ', l: '大タスク', n: '5. クロスセルの仕込み（Q2-Q4）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '5-1：湊相続コンシェルとの連携フロー確認', d: '4月中' },
  { b: 'コンシェルジュ', l: '小タスク', n: '弥田に施設入居→自宅売却の対応フローを確認', a: '金子', d: '4月中' },
  { b: 'コンシェルジュ', l: '中タスク', n: '5-2：じげんとの検証提携の進捗管理', d: '通年' },
  { b: 'コンシェルジュ', l: '小タスク', n: '四半期に1回の進捗共有', a: '金子', d: '四半期ごと' },
  { b: 'コンシェルジュ', l: '中タスク', n: '5-3：住友生命との事業連携', d: '4/16' },
  { b: 'コンシェルジュ', l: '小タスク', n: '4/16 MTGでソナエソ連携の具体案を提示', a: '金子', d: '4/16' },
  { b: 'コンシェルジュ', l: '小タスク', n: '提案資料作成', a: '金子', d: '4/14' },

  { b: 'コンシェルジュ', l: '大タスク', n: '6. YouTube/SNS発信（コンシェルジュ集客に集中）（Q2-Q4）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '6-1：コンテンツ戦略の設計', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '4つの窓口ごとのコンテンツ企画（施設探しを最優先）', a: '金子', d: '5月', notes: '困難ケース特化。大手ポータルにない実例ベース' },
  { b: 'コンシェルジュ', l: '小タスク', n: '新潟ローカル特化コンテンツ企画', a: '金子', d: '5月', notes: 'ローカルSEOで直接リーチ' },
  { b: 'コンシェルジュ', l: '中タスク', n: '6-2：最初の動画3本の制作', d: '6月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '撮影・編集・公開（施設探し特化で3本）', a: '金子・山崎', d: '6月', notes: '山崎出演 or 対談形式' },
  { b: 'コンシェルジュ', l: '小タスク', n: '施設訪問と同時に取材コンテンツを蓄積', a: '金子', d: '6月〜' },
  { b: 'コンシェルジュ', l: '中タスク', n: '6-3：継続発信の体制構築', d: 'Q3以降' },
  { b: 'コンシェルジュ', l: '小タスク', n: '月2〜4本ペースの発信体制を確立', a: '金子', d: 'Q3以降' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'YouTube→LP→無料相談の導線を設計', a: '金子', d: 'Q3' },

  { b: 'コンシェルジュ', l: '大タスク', n: '7. オフラインネットワーク構築（Q3-Q4・需要確認後）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '7-1：新潟の包括・施設への訪問', d: 'Q3以降' },
  { b: 'コンシェルジュ', l: '小タスク', n: '新潟の包括2〜3箇所への訪問', a: '金子', d: 'Q3以降' },
  { b: 'コンシェルジュ', l: '小タスク', n: '施設5〜10箇所の実地調査', a: '金子', d: 'Q3以降', notes: 'YouTube取材と同時に' },

  { b: 'コンシェルジュ', l: '大タスク', n: '8. 助成金・補助金の獲得（Q1-Q2）' },
  { b: 'コンシェルジュ', l: '中タスク', n: '8-1：コンシェルジュ提供に使える助成金リサーチ', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '重層的支援体制整備事業の公募情報モニタリング', a: '金子', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '孤独孤立対策関連（内閣府）の要件確認', a: '金子', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '生活困窮者自立支援事業の適合性確認', a: '金子', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'トヨタ財団800万の中でコンシェルジュ実証費用に使える範囲を確認', a: '金子', d: '4月' },
  { b: 'コンシェルジュ', l: '中タスク', n: '8-2：コンシェルジュ育成に使える助成金リサーチ', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '厚労省の市民後見人養成事業の要件確認', a: '金子', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '峯田氏の行政書士会連携で使える養成関連予算の確認', a: '金子→峯田', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '経産省アドバンスド・エッセンシャルワーカー関連リサーチ', a: '金子', d: '5月' },
  { b: 'コンシェルジュ', l: '小タスク', n: '人材開発支援助成金のコンシェルジュ養成適合性を労働局に問合せ', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '中タスク', n: '8-3：新潟の補助金・助成金リサーチ', d: '4月' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'NICO（にいがた産業創造機構）の補助金一覧を確認', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '小タスク', n: 'ICP（新潟県ICT推進協議会）の補助金一覧を確認', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '小タスク', n: '新潟での創業助成（新潟市・新潟県）の要件確認', a: '金子', d: '4月第2週' },
  { b: 'コンシェルジュ', l: '中タスク', n: '8-4：リサーチ結果の整理と申請判断', d: '5月末' },
  { b: 'コンシェルジュ', l: '小タスク', n: '全助成金を1つのスプレッドシートに統合（全事業分を一括管理）', a: '金子', d: '5月末', notes: 'リサーチは合計2〜3日に収める' },

  // ── DX事業 ──────────────────────────────────────────────
  { b: 'DX事業', l: '大タスク', n: '1. 確定案件の実行と刈り取り（Q1-Q2）' },
  { b: 'DX事業', l: '中タスク', n: '1-1：名古屋市の困難ケース対応調査', d: '8月' },
  { b: 'DX事業', l: '小タスク', n: 'アンケート設計', a: '金子・鈴木氏', d: '5月', notes: 'MURC鈴木氏と連携' },
  { b: 'DX事業', l: '小タスク', n: '現地調査の実行', a: '金子', d: '6-7月' },
  { b: 'DX事業', l: '小タスク', n: '報告書作成', a: '金子', d: '8月', notes: '30万円' },
  { b: 'DX事業', l: '小タスク', n: '調査に「やるべきこと/やるべきでないこと」の仕分け視点を組込む', a: '金子', d: '5月', notes: 'コンシェルジュ紹介ルートの設計材料' },
  { b: 'DX事業', l: '小タスク', n: '調査結果をエビデンスとして整理', a: '金子', d: '8月' },
  { b: 'DX事業', l: '中タスク', n: '1-2：山形の営業と6月総会登壇', d: '6月' },
  { b: 'DX事業', l: '小タスク', n: '齋野常務へ研修PDFをメール送付', a: '金子', d: '即実行' },
  { b: 'DX事業', l: '小タスク', n: '紹介された法人に個別説明', a: '金子', d: '4-5月' },
  { b: 'DX事業', l: '小タスク', n: '6/19総会登壇準備', a: '金子', d: '5月中', notes: '40団体にDX研修を案内' },
  { b: 'DX事業', l: '小タスク', n: 'コンシェルジュ告知も同梱', a: '金子', d: '6/19', notes: '同一出張' },
  { b: 'DX事業', l: '小タスク', n: '登壇後フォロー：関心法人に1週間以内に個別連絡', a: '金子', d: '6月末' },

  { b: 'DX事業', l: '大タスク', n: '2. DX研修の営業パイプライン構築（Q1-Q3）', notes: 'ターゲット：包括＋介護事業所＋障害福祉事業所（藤田氏MTGで拡大）' },
  { b: 'DX事業', l: '中タスク', n: '2-1：藤田氏ネットワーク経由の営業（★新規）', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: '藤田氏のオンラインサロン（100人・全員介護福祉系）でプレゼン日程調整', a: '金子', d: '4月第2週', notes: '「結構オーダー入ると思う」と藤田氏発言' },
  { b: 'DX事業', l: '小タスク', n: 'プレゼン資料準備（ハンズオン伴走の差別化を強調）', a: '金子', d: '4月中', notes: '競合は座学研修ばかり。ハンズオンがない' },
  { b: 'DX事業', l: '小タスク', n: 'プレゼン実行', a: '金子', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: '藤田氏の直営会社の社長と接続→パイロット導入', a: '金子', d: '4月中', notes: 'LINE経由で紹介済み。即導入可能' },
  { b: 'DX事業', l: '小タスク', n: '藤田氏のAIナレッジBot構築（Gem＋NotebookLM）', a: '金子', d: '4月中', notes: '信頼関係強化＋実績。金子の技術力のデモ' },
  { b: 'DX事業', l: '中タスク', n: '2-2：峯田氏ネットワーク経由の法人営業', d: '9月' },
  { b: 'DX事業', l: '小タスク', n: '紹介法人に個別説明（月2〜3件ペース）', a: '金子', d: '4-9月' },
  { b: 'DX事業', l: '小タスク', n: '総会後の反応法人への提案書作成・送付', a: '金子', d: '7月', notes: '目標：5〜10件の商談' },
  { b: 'DX事業', l: '中タスク', n: '2-3：Facebook DM営業の継続', d: '9月' },
  { b: 'DX事業', l: '小タスク', n: '福祉経営者コミュニティへのDM送付', a: '金子', d: '4-9月' },
  { b: 'DX事業', l: '小タスク', n: '反応率計測→メッセージを2週間ごとに改善', a: '金子', d: '継続' },
  { b: 'DX事業', l: '中タスク', n: '2-4：Instagram発信の開始（★新規）', d: '4月〜' },
  { b: 'DX事業', l: '小タスク', n: '介護福祉系の経営者をフォローしまくる', a: '金子', d: '4月〜', notes: '藤田氏：経営者はInstagramを見ている' },
  { b: 'DX事業', l: '小タスク', n: 'DX研修の実例・ツール紹介の投稿を開始（リール＋カルーセル）', a: '金子', d: '4月〜', notes: '豊橋・名古屋の実例をコンテンツ化' },
  { b: 'DX事業', l: '小タスク', n: '障害福祉の経営者を重点的にターゲット', a: '金子', d: '4月〜', notes: '障害福祉の方が導入率高い（藤田氏）' },
  { b: 'DX事業', l: '中タスク', n: '2-5：ピッチイベント・アクセラへの参加', d: '6月' },
  { b: 'DX事業', l: '小タスク', n: 'pocground tokyo への応募', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '小タスク', n: 'NEXs Tokyo への応募', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '小タスク', n: '自治体ピッチイベント担当者への登壇打診', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '中タスク', n: '2-6：新潟NICO DX支援事業のアドバイザー登録', d: '4月中' },
  { b: 'DX事業', l: '小タスク', n: 'NICOのDX支援事業アドバイザー登録手続きを確認・申請', a: '金子', d: '4月第2週', notes: '介護会社等からの相談チャネル' },
  { b: 'DX事業', l: '小タスク', n: '登録後、相談案件が来た場合の対応フローを整理', a: '金子', d: '4月中' },

  { b: 'DX事業', l: '大タスク', n: '3. 研修パッケージの整備（Q1-Q2）' },
  { b: 'DX事業', l: '中タスク', n: '3-1：助成金の適合確認', d: '4月第2週' },
  { b: 'DX事業', l: '小タスク', n: '人材開発支援助成金の適合性を労働局に問合せ', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '小タスク', n: '介護テクノロジー導入支援事業の要件確認', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '中タスク', n: '3-2：研修パッケージの改善', d: '7月' },
  { b: 'DX事業', l: '小タスク', n: '藤田氏直営会社でのパイロット結果を反映', a: '金子', d: '6月', notes: '★藤田氏パイロットが最初の実績になる' },
  { b: 'DX事業', l: '小タスク', n: '助成金要件に合わせた内容調整', a: '金子', d: '7月' },
  { b: 'DX事業', l: '小タスク', n: '申請テンプレート整備 or 提携社労士の紹介', a: '金子', d: '7月' },
  { b: 'DX事業', l: '中タスク', n: '3-3：ターゲット拡大の反映', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: '提案書を「包括向け」から「介護・障害福祉事業所全般向け」に書き換え', a: '金子', d: '5月', notes: '藤田氏：包括に絞らない方がいい' },
  { b: 'DX事業', l: '小タスク', n: '障害福祉事業所向けの訴求ポイントを追加', a: '金子', d: '5月', notes: '若い経営者が多い、事業が不安定→改善ニーズ強い' },
  { b: 'DX事業', l: '小タスク', n: '名古屋市の実績を入れた提案書テンプレート更新', a: '金子', d: '5月' },

  { b: 'DX事業', l: '大タスク', n: '4. DX→コンシェルジュ紹介ルートの設計（Q2-Q3）' },
  { b: 'DX事業', l: '中タスク', n: '4-1：名古屋調査結果から仕分けモデル作成', d: '8月' },
  { b: 'DX事業', l: '小タスク', n: '包括の「やるべきこと」「やるべきでないこと」を明確化', a: '金子', d: '8月' },
  { b: 'DX事業', l: '小タスク', n: '仕分けモデルを1枚のフロー図にまとめる', a: '金子', d: '8月' },
  { b: 'DX事業', l: '中タスク', n: '4-2：包括へのコンシェルジュ紹介の提案', d: 'Q3' },
  { b: 'DX事業', l: '小タスク', n: '名古屋DXで入った包括1〜2箇所に紹介を持ち込む', a: '金子', d: 'Q3' },

  { b: 'DX事業', l: '大タスク', n: '5. DX関連の補助金獲得（Q1-Q3）' },
  { b: 'DX事業', l: '中タスク', n: '5-1：既知の補助金の要件確認', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: 'ケアプランデータ連携システム普及支援（最大850万円）の要件確認', a: '金子', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: '厚労省アドバイザー制度の活用可能性確認', a: '金子', d: '5月' },
  { b: 'DX事業', l: '中タスク', n: '5-2：新潟NICO・ICP関連の補助金リサーチ', d: '4月中' },
  { b: 'DX事業', l: '小タスク', n: 'NICOの補助金一覧を確認', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '小タスク', n: 'ICPの補助金一覧を確認', a: '金子', d: '4月第2週' },
  { b: 'DX事業', l: '中タスク', n: '5-3：新規の補助金リサーチ', d: '5月' },
  { b: 'DX事業', l: '小タスク', n: '自治体DX関連の補助金を網羅的にリサーチ', a: '金子', d: '5月' },
  { b: 'DX事業', l: '中タスク', n: '5-4：申請判断と実行', d: 'Q3' },
  { b: 'DX事業', l: '小タスク', n: '実績が出てから連名応募可能な自治体を選定', a: '金子', d: 'Q3' },

  // ── リスキリング ──────────────────────────────────────
  { b: 'リスキリング', l: '大タスク', n: '1. 中野区コミュニティの立ち上げ（Q1-Q2）', notes: 'ナカノコメンバーが現地運営主導' },
  { b: 'リスキリング', l: '中タスク', n: '1-1：5月第1回イベントの準備', d: '4月末' },
  { b: 'リスキリング', l: '小タスク', n: '会場確定（西武信金本店会議室）', a: '金子・ナカノコ', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: 'イベント企画確定', a: '金子・ナカノコ', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: 'Facebook広告で集客（中野区ターゲット）', a: 'ナカノコ', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: 'ナカノコネットワークへの案内', a: 'ナカノコ', d: '4月中' },
  { b: 'リスキリング', l: '中タスク', n: '1-2：運営体制の確認', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: 'ナカノコメンバーの運営役割分担を確定', a: '金子・ナカノコ', d: '4月第2週', notes: '金子は月1回参加＋遠隔ディレクション' },

  { b: 'リスキリング', l: '大タスク', n: '2. 中野区の月次運営（Q2-Q3）' },
  { b: 'リスキリング', l: '中タスク', n: '2-1：月1回の定例サロン化', d: '6月〜' },
  { b: 'リスキリング', l: '小タスク', n: '第1回後に月1回定例スケジュール設定', a: 'ナカノコ', d: '6月' },
  { b: 'リスキリング', l: '小タスク', n: '参加者数、新規/リピート率、属性を毎回記録', a: 'ナカノコ', d: '継続' },
  { b: 'リスキリング', l: '中タスク', n: '2-2：コンテンツ設計', d: '6月' },
  { b: 'リスキリング', l: '小タスク', n: '毎月のテーマを3ヶ月先まで決定', a: '金子・山崎', d: '6月' },
  { b: 'リスキリング', l: '小タスク', n: '外部講師（村山・弥田等）をゲスト登壇', a: '金子', d: '6月〜' },

  { b: 'リスキリング', l: '大タスク', n: '3. 新潟コミュニティのFB検証→立ち上げ（Q1-Q2）', notes: '集客はFB広告。訴求は自己実現型' },
  { b: 'リスキリング', l: '中タスク', n: '3-1：Facebook広告による需要検証', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: 'FB広告クリエイティブ作成', a: '金子', d: '4月第2週', notes: 'ターゲット：新潟55〜74歳' },
  { b: 'リスキリング', l: '小タスク', n: '少額配信（1〜3万円）→反応計測', a: '金子', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: '判定：リード10件以上なら第1回開催に進む', a: '金子', d: '4月末' },
  { b: 'リスキリング', l: '中タスク', n: '3-2：第1回イベントの開催', d: '5月' },
  { b: 'リスキリング', l: '小タスク', n: '山崎氏に対談ゲストを打診', a: '金子', d: '4月中' },
  { b: 'リスキリング', l: '小タスク', n: '会場決定', a: '金子', d: '4月中', notes: '「格」のある場所' },
  { b: 'リスキリング', l: '小タスク', n: '参加費3,000〜5,000円、定員10〜15名で開催', a: '金子・山崎', d: '5月' },
  { b: 'リスキリング', l: '小タスク', n: 'ミニWS「自分の経験の棚卸し」でゼミ形式の検証', a: '金子', d: '5月' },
  { b: 'リスキリング', l: '中タスク', n: '3-3：会員制サロンへの移行判断', d: '6月' },
  { b: 'リスキリング', l: '小タスク', n: '第1回の参加者反応を分析', a: '金子', d: '6月' },
  { b: 'リスキリング', l: '小タスク', n: '月額制サロン（15,000円想定）の設計を具体化', a: '金子', d: '6月' },

  { b: 'リスキリング', l: '大タスク', n: '4. アップセル構造の検証（Q3-Q4）' },
  { b: 'リスキリング', l: '中タスク', n: '4-1：参加者との関係性の深度測定', d: '10月以降' },
  { b: 'リスキリング', l: '小タスク', n: 'アンケート「施設探しが必要になったら誰に相談するか」', a: '金子', d: '10月' },
  { b: 'リスキリング', l: '小タスク', n: '参加者から相談が1件でも来たかを記録', a: '金子', d: '継続' },
  { b: 'リスキリング', l: '中タスク', n: '4-2：翻訳者育成の種まき', d: 'Q3-Q4' },
  { b: 'リスキリング', l: '小タスク', n: '「自分も貢献したい」という参加者を観察・記録', a: '金子', d: 'Q3-Q4' },

  // ── ケアガイド ───────────────────────────────────────
  { b: 'ケアガイド', l: '大タスク', n: '1. トヨタ財団研究助成の実行（通年・800万円）', notes: '義務。中野区＋もう1自治体で堺市横展開' },
  { b: 'ケアガイド', l: '中タスク', n: '1-1：研究設計の具体化', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: '実施計画を具体化', a: '金子', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: '「AI有効分野」と「専門職接続分野」の分類基準を設計', a: '金子', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: '横展開先の自治体候補の選定基準を決定', a: '金子', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: '堺市とのデータ利用許諾の確認', a: '金子', d: '4月', notes: '未確認なら研究が止まる' },
  { b: 'ケアガイド', l: '小タスク', n: 'トヨタ財団予算の使途制約を確認', a: '金子', d: '4月' },
  { b: 'ケアガイド', l: '中タスク', n: '1-2：堺市データの分析', d: '8月' },
  { b: 'ケアガイド', l: '小タスク', n: '22,616メッセージの利用データ分析', a: '金子', d: '5-8月' },
  { b: 'ケアガイド', l: '小タスク', n: '相談内容を5領域に分類', a: '金子', d: '7月' },
  { b: 'ケアガイド', l: '小タスク', n: 'セルフ完結vs専門職接続の比率を算出', a: '金子', d: '8月' },
  { b: 'ケアガイド', l: '中タスク', n: '1-3：横展開先の自治体選定と導入', d: '9月' },
  { b: 'ケアガイド', l: '小タスク', n: '中野区での導入可能性をナカノコ経由で打診', a: '金子', d: '6月' },
  { b: 'ケアガイド', l: '小タスク', n: '山形or名古屋に打診', a: '金子', d: '6月' },
  { b: 'ケアガイド', l: '小タスク', n: '自治体との契約・導入・運用開始', a: '金子', d: '7-9月', notes: '1自治体2-3ヶ月' },
  { b: 'ケアガイド', l: '中タスク', n: '1-4：研究成果の整理', d: 'Q3-Q4' },
  { b: 'ケアガイド', l: '小タスク', n: '学術論文 or 報告書として整理', a: '金子', d: 'Q4' },
  { b: 'ケアガイド', l: '小タスク', n: '厚労省政策提言の根拠資料に転用', a: '金子', d: 'Q4' },

  { b: 'ケアガイド', l: '大タスク', n: '2. MVPの改善（Q1-Q3）', notes: 'コンシェルジュ実務がケアガイドの開発データになる' },
  { b: 'ケアガイド', l: '中タスク', n: '2-1：現状MVPの課題整理', d: '4月' },
  { b: 'ケアガイド', l: '小タスク', n: '改善点洗い出し', a: '金子', d: '4月' },
  { b: 'ケアガイド', l: '中タスク', n: '2-2：自治体DBの構築方法設計', d: '7月' },
  { b: 'ケアガイド', l: '小タスク', n: 'DXで入った自治体のデータ活用手順を設計', a: '金子', d: '7月' },
  { b: 'ケアガイド', l: '中タスク', n: '2-3：MVP改善の実行', d: '9月' },
  { b: 'ケアガイド', l: '小タスク', n: '堺市データ分析結果を反映した診断ロジック改善', a: '金子', d: '9月' },
  { b: 'ケアガイド', l: '小タスク', n: '自治体DB（最低1自治体分）の組み込み', a: '金子', d: '9月' },
  { b: 'ケアガイド', l: '小タスク', n: 'ケアガイド→コンシェルジュ接続の導線設計', a: '金子', d: '9月' },

  { b: 'ケアガイド', l: '大タスク', n: '3. ケアガイド関連の助成金リサーチ（Q1-Q2）' },
  { b: 'ケアガイド', l: '中タスク', n: '3-1：リサーチ', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: 'JanPIA（休眠預金）の公募情報確認', a: '金子', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: 'デジタル田園都市国家構想関連', a: '金子', d: '5月' },
  { b: 'ケアガイド', l: '小タスク', n: 'ICT関連の研究助成リサーチ', a: '金子', d: '5月' },

  // ── 資金調達 ──────────────────────────────────────────
  { b: '資金調達', l: '大タスク', n: '1. 投資家向け資料の改訂（Q1）' },
  { b: '資金調達', l: '中タスク', n: '1-1：ピッチ資料の改訂', d: '4月中' },
  { b: '資金調達', l: '小タスク', n: 'v3戦略を反映した新ピッチ資料作成', a: '金子', d: '4月中' },
  { b: '資金調達', l: '小タスク', n: '井上氏指摘反映：ファネル数字を追加', a: '金子', d: '4月中' },
  { b: '資金調達', l: '小タスク', n: '水谷氏指摘反映：TAM 800〜1,200億で提示', a: '金子', d: '4月中' },
  { b: '資金調達', l: '中タスク', n: '1-2：検証データの組み込み', d: 'Q2以降' },
  { b: '資金調達', l: '小タスク', n: 'デジタル需要検証の結果を反映', a: '金子', d: 'Q2' },
  { b: '資金調達', l: '小タスク', n: '名古屋調査結果を反映', a: '金子', d: 'Q3' },

  { b: '資金調達', l: '大タスク', n: '2. CVC/インパクトファンドとの面談（Q2-Q3）' },
  { b: '資金調達', l: '中タスク', n: '2-1：住友生命CVC', d: '4/16' },
  { b: '資金調達', l: '小タスク', n: '4/16 MTGでソナエソ連携具体案を提示', a: '金子', d: '4/16' },
  { b: '資金調達', l: '中タスク', n: '2-2：既存パイプラインのフォロー', d: '6月' },
  { b: '資金調達', l: '小タスク', n: '赤富士・西武信金キャピタル・井上氏紹介先との面談継続', a: '金子', d: '4-6月' },
  { b: '資金調達', l: '中タスク', n: '2-3：インパクトファンドへのアプローチ', d: 'Q3' },
  { b: '資金調達', l: '小タスク', n: 'LivEQualityモデルの研究', a: '金子', d: '5月中' },
  { b: '資金調達', l: '小タスク', n: 'インパクトファンド候補リストアップ', a: '金子', d: '6月' },
  { b: '資金調達', l: '中タスク', n: '2-4：じげんとの資本提携判断', d: 'Q3-Q4' },
  { b: '資金調達', l: '小タスク', n: '検証データが出てから具体的提携の形を提案', a: '金子', d: 'Q3-Q4' },

  { b: '資金調達', l: '大タスク', n: '3. 新潟での創業関連助成金（Q1）' },
  { b: '資金調達', l: '中タスク', n: '3-1：新潟の創業助成リサーチ', d: '4月第2週' },
  { b: '資金調達', l: '小タスク', n: '新潟市の創業助成金の要件確認', a: '金子', d: '4月第2週' },
  { b: '資金調達', l: '小タスク', n: '新潟県の創業支援関連の助成金確認', a: '金子', d: '4月第2週' },
  { b: '資金調達', l: '小タスク', n: 'NICOの創業支援メニュー確認', a: '金子', d: '4月第2週' },

  { b: '資金調達', l: '大タスク', n: '4. 一般社団法人の設立判断モニタリング（通年）' },
  { b: '資金調達', l: '中タスク', n: '4-1：設立トリガーの確認', d: '四半期ごと' },
  { b: '資金調達', l: '小タスク', n: '設立トリガー3項目の確認', a: '金子', d: '四半期ごと' },

  // ── 集客戦略サマリー ──────────────────────────────────
  { b: '集客戦略サマリー', l: '大タスク', n: '集客チャネルの使い分け（全事業共通方針）' },
  { b: '集客戦略サマリー', l: '中タスク', n: 'YouTube → コンシェルジュ集客に集中' },
  { b: '集客戦略サマリー', l: '小タスク', n: '施設探し特化の動画を最優先で制作', a: '金子・山崎', d: 'Q2〜', notes: '困難ケース特化。山崎の24年の知見が武器' },
  { b: '集客戦略サマリー', l: '小タスク', n: '4窓口ごとにシリーズ化', a: '金子', d: 'Q2〜' },
  { b: '集客戦略サマリー', l: '小タスク', n: '新潟ローカル特化コンテンツ', a: '金子', d: 'Q2〜' },
  { b: '集客戦略サマリー', l: '中タスク', n: 'Instagram → DX事業の経営者向け発信（★藤田氏MTGで判明）' },
  { b: '集客戦略サマリー', l: '小タスク', n: '介護福祉系の経営者をフォローしまくる', a: '金子', d: '4月〜', notes: '藤田氏：経営者はInstagramを見ている' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'DX研修の実例・ツール紹介の投稿', a: '金子', d: '4月〜', notes: '豊橋・名古屋の実例をコンテンツ化' },
  { b: '集客戦略サマリー', l: '小タスク', n: '障害福祉の経営者を重点ターゲット', a: '金子', d: '4月〜', notes: '障害福祉の方が導入率高い' },
  { b: '集客戦略サマリー', l: '中タスク', n: 'Facebook広告 → リスキリング集客に集中' },
  { b: '集客戦略サマリー', l: '小タスク', n: '新潟55〜74歳退職者ターゲット', a: '金子', d: '4月', notes: '訴求：「あなたの経験で社会を変える」' },
  { b: '集客戦略サマリー', l: '小タスク', n: '中野区55〜74歳ターゲット', a: 'ナカノコ', d: '4月' },
  { b: '集客戦略サマリー', l: '中タスク', n: 'オフライン営業 → DX集客＋コンシェルジュ士業NW' },
  { b: '集客戦略サマリー', l: '小タスク', n: '★藤田氏オンラインサロン（100人）でプレゼン', a: '金子', d: '5月', notes: '即効性の高い営業チャネル' },
  { b: '集客戦略サマリー', l: '小タスク', n: '峯田氏NW経由の法人営業＋6月総会登壇', a: '金子', d: '4-6月' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'Facebook DM（福祉経営者コミュニティ）', a: '金子', d: '4-9月' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'NICOアドバイザー登録→介護会社からの相談チャネル', a: '金子', d: '4月' },
  { b: '集客戦略サマリー', l: '小タスク', n: '★士業ネットワーク構築（村山・弥田経由）', a: '金子', d: '4月〜', notes: 'コンシェルジュの最有力紹介ルート' },
  { b: '集客戦略サマリー', l: '中タスク', n: 'Google広告（少額） → コンシェルジュ需要検証' },
  { b: '集客戦略サマリー', l: '小タスク', n: '新潟＋山形でLP＋少額配信', a: '金子', d: '4-5月', notes: '検証目的。5〜10万円' },
  { b: '集客戦略サマリー', l: '大タスク', n: '原則：同じ媒体でも訴求は分ける' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'コンシェルジュ：「今困っている人」向け。「1ヶ月で施設確保」', notes: '課題解決型' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'リスキリング：「何かやりたい人」向け。「あなたの経験で社会を変える」', notes: '自己実現型' },
  { b: '集客戦略サマリー', l: '小タスク', n: 'DX：事業所経営者向け。「業務の棚卸しからハンズオンで伴走」', notes: '業務効率化型' },
  { b: '集客戦略サマリー', l: '大タスク', n: 'コンシェルジュの集客ルート優先順位' },
  { b: '集客戦略サマリー', l: '小タスク', n: '1位：士業ネットワーク（村山・弥田経由）→ 紹介が最も信頼度が高い', notes: '包括より士業が優先' },
  { b: '集客戦略サマリー', l: '小タスク', n: '2位：YouTube/SNS → 全国リーチ。信頼構築に1〜2年' },
  { b: '集客戦略サマリー', l: '小タスク', n: '3位：Google広告 → 需要検証目的。恒常的な集客には向かない' },
  { b: '集客戦略サマリー', l: '小タスク', n: '4位：DX→包括紹介ルート → 機能するか未検証。Year 1後半で検証' },
  { b: '集客戦略サマリー', l: '小タスク', n: '5位：コミュニティ（アップセル） → 時間がかかる。Year 1では兆候を見る程度' },
]

interface CriterionData {
  business: string
  deadline: string
  category: string
  description: string
}

const CRITERIA: CriterionData[] = [
  { business: 'コンシェルジュ', deadline: '6月末', category: 'デジタル需要検証', description: '相談申込が1件以上あるか' },
  { business: 'コンシェルジュ', deadline: '6月末', category: '山形オフライン需要', description: '総会後に問い合わせ・紹介が1件以上あるか' },
  { business: 'コンシェルジュ', deadline: '6月末', category: '士業ネットワーク', description: '士業2名以上と関係構築し紹介を依頼できているか' },
  { business: 'コンシェルジュ', deadline: '9月末', category: '有料転換', description: '無料相談から有料案件に1件でも転換したか' },
  { business: 'コンシェルジュ', deadline: '3月末', category: '複製可能性', description: '山崎なしで案件を完了できたか' },
  { business: 'DX事業', deadline: '5月末', category: '藤田氏パイロット', description: '直営会社でのDX研修パイロットが完了しているか' },
  { business: 'DX事業', deadline: '6月末', category: '総会後の反応', description: '山形40団体からDX研修の引き合いが3件以上あるか' },
  { business: 'DX事業', deadline: '9月末', category: '売上進捗', description: '累計300万円以上の受注があるか' },
  { business: 'DX事業', deadline: '12月末', category: '紹介ルート', description: 'DXで入った包括からコンシェルジュへの紹介が1件でも発生したか' },
  { business: 'DX事業', deadline: '3月末', category: '年間売上', description: '600万円を達成したか' },
  { business: 'リスキリング', deadline: '4月末', category: '新潟FB検証', description: 'リード10件以上あるか' },
  { business: 'リスキリング', deadline: '5月末', category: '中野第1回', description: '参加者15名以上集まったか' },
  { business: 'リスキリング', deadline: '9月末', category: '定例化', description: '月1回が3回以上継続しているか' },
  { business: 'リスキリング', deadline: '3月末', category: 'アップセル兆候', description: '参加者から相談が1件でも発生したか' },
  { business: 'ケアガイド', deadline: '8月末', category: '堺市データ分析', description: 'セルフ完結率の実測値が出ているか' },
  { business: 'ケアガイド', deadline: '9月末', category: '他自治体展開', description: '1自治体以上で導入が決まっているか' },
  { business: 'ケアガイド', deadline: '3月末', category: 'MVP', description: '自治体DB1つ以上組込んだ改善版が稼働しているか' },
  { business: 'ケアガイド', deadline: '3月末', category: 'エビデンス', description: 'トヨタ財団報告書が完成しているか' },
  { business: '資金調達', deadline: '6月末', category: '面談進捗', description: '3件以上の面談が完了しているか' },
  { business: '資金調達', deadline: '9月末', category: '出資検討', description: '1社以上がDD段階に進んでいるか' },
  { business: '資金調達', deadline: '3月末', category: '調達', description: '3,000万円の調達完了 or 見通しが立っているか' },
]

interface TimelineData {
  business: string
  task_name: string
  months: { month: string; type: '●' | '○' | null }[]
}

const TIMELINE: TimelineData[] = [
  { business: 'コンシェルジュ', task_name: 'KW調査＋LP制作＋広告', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: 'デジタル検証判定', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: '●' }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: '士業ネットワーク構築（村山・弥田経由）', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: '山形：峯田NW接続＋総会告知', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: 'ニッセイ財団申請', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: 'YouTube/SNS発信（施設探し特化）', months: [{ month: '4月', type: null }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: '●' }, { month: '10月', type: '●' }, { month: '11月', type: '●' }, { month: '12月', type: '●' }, { month: '1月', type: '●' }, { month: '2月', type: '●' }, { month: '3月', type: '●' }] },
  { business: 'コンシェルジュ', task_name: 'マニュアル抽出・フロー設計', months: [{ month: '4月', type: null }, { month: '5月', type: '○' }, { month: '6月', type: '○' }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: '助成金リサーチ（NICO/ICP含む）', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'コンシェルジュ', task_name: 'オフライン活動（需要確認後）', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: '○' }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: '○' }, { month: '1月', type: '○' }, { month: '2月', type: '○' }, { month: '3月', type: '○' }] },
  { business: 'DX事業', task_name: '名古屋調査', months: [{ month: '4月', type: null }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: '山形営業＋総会登壇', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: '藤田氏サロンプレゼン＋直営パイロット', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: '藤田氏AIナレッジBot構築', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: 'Instagram発信（経営者向け）', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: '●' }, { month: '10月', type: '●' }, { month: '11月', type: '●' }, { month: '12月', type: '●' }, { month: '1月', type: '●' }, { month: '2月', type: '●' }, { month: '3月', type: '●' }] },
  { business: 'DX事業', task_name: '法人営業（峯田NW・FB DM）', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: '●' }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: 'NICOアドバイザー登録', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: '研修パッケージ改善＋ターゲット拡大', months: [{ month: '4月', type: null }, { month: '5月', type: '○' }, { month: '6月', type: '○' }, { month: '7月', type: '○' }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'DX事業', task_name: '紹介ルート設計', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: '○' }, { month: '9月', type: '○' }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'リスキリング', task_name: '中野：第1回イベント準備', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'リスキリング', task_name: '中野：月次運営', months: [{ month: '4月', type: null }, { month: '5月', type: '○' }, { month: '6月', type: '○' }, { month: '7月', type: '○' }, { month: '8月', type: '○' }, { month: '9月', type: '○' }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: '○' }, { month: '1月', type: '○' }, { month: '2月', type: '○' }, { month: '3月', type: '○' }] },
  { business: 'リスキリング', task_name: '新潟：FB検証', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'リスキリング', task_name: '新潟：第1回イベント', months: [{ month: '4月', type: null }, { month: '5月', type: '○' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'リスキリング', task_name: '新潟：サロン運営', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: '○' }, { month: '7月', type: '○' }, { month: '8月', type: '○' }, { month: '9月', type: '○' }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: '○' }, { month: '1月', type: '○' }, { month: '2月', type: '○' }, { month: '3月', type: '○' }] },
  { business: 'リスキリング', task_name: 'アップセル検証', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: '○' }, { month: '1月', type: '○' }, { month: '2月', type: '○' }, { month: '3月', type: '○' }] },
  { business: 'ケアガイド', task_name: '研究設計＋堺市許諾確認', months: [{ month: '4月', type: '●' }, { month: '5月', type: '●' }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'ケアガイド', task_name: '堺市データ分析', months: [{ month: '4月', type: null }, { month: '5月', type: '●' }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'ケアガイド', task_name: '他自治体展開', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: '●' }, { month: '7月', type: '●' }, { month: '8月', type: '●' }, { month: '9月', type: '●' }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'ケアガイド', task_name: 'MVP改善', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: '○' }, { month: '7月', type: '○' }, { month: '8月', type: '○' }, { month: '9月', type: '○' }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: 'ケアガイド', task_name: '研究成果整理', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: '○' }, { month: '1月', type: '○' }, { month: '2月', type: '○' }, { month: '3月', type: '○' }] },
  { business: '資金調達', task_name: 'ピッチ資料改訂', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: '資金調達', task_name: '住友生命MTG', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: '資金調達', task_name: '新潟創業助成リサーチ', months: [{ month: '4月', type: '●' }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: null }, { month: '8月', type: null }, { month: '9月', type: null }, { month: '10月', type: null }, { month: '11月', type: null }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
  { business: '資金調達', task_name: '本格面談（検証データ後）', months: [{ month: '4月', type: null }, { month: '5月', type: null }, { month: '6月', type: null }, { month: '7月', type: '○' }, { month: '8月', type: '○' }, { month: '9月', type: '○' }, { month: '10月', type: '○' }, { month: '11月', type: '○' }, { month: '12月', type: null }, { month: '1月', type: null }, { month: '2月', type: null }, { month: '3月', type: null }] },
]

export function runSeed(db: Database.Database) {
  const taskStmt = db.prepare(`
    INSERT INTO tasks (business, level, parent_id, name, assignee, deadline, notes, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, '未着手', ?)
  `)
  const timelineStmt = db.prepare(`
    INSERT INTO timeline_items (business, task_name, months, sort_order) VALUES (?, ?, ?, ?)
  `)
  const criteriaStmt = db.prepare(`
    INSERT INTO criteria (business, deadline, category, description) VALUES (?, ?, ?, ?)
  `)

  const insertAll = db.transaction(() => {
    let currentBig: number | null = null
    let currentMid: number | null = null
    let sortOrder = 0

    for (const t of TASKS) {
      let parentId: number | null = null
      if (t.l === '中タスク') {
        parentId = currentBig
      } else if (t.l === '小タスク') {
        parentId = currentMid ?? currentBig
      }

      const result = taskStmt.run(
        t.b, t.l, parentId,
        t.n, t.a ?? null, t.d ?? null, t.notes ?? null,
        sortOrder++
      )
      const newId = result.lastInsertRowid as number

      if (t.l === '大タスク') {
        currentBig = newId
        currentMid = null
      } else if (t.l === '中タスク') {
        currentMid = newId
      }
    }

    TIMELINE.forEach((item, i) => {
      timelineStmt.run(item.business, item.task_name, JSON.stringify(item.months), i)
    })

    for (const c of CRITERIA) {
      criteriaStmt.run(c.business, c.deadline, c.category, c.description)
    }
  })

  insertAll()
}
