#nullable enable

using System;
using System.Collections.Generic;
using System.Linq;
using Aredoko.Client;
using Aredoko.Indexing;
using Aredoko.Protocol;
using UnityEditor;
using UnityEngine;

namespace Aredoko.Window
{
    public sealed class AredokoWindow : EditorWindow
    {
        const int ResultLimit = 120;
        const double SearchDelay = 0.4;
        const double StatusInterval = 2.0;
        const float DetailWidth = 280f;
        const float MinTile = 64f;
        const float MaxTile = 192f;

        readonly HashSet<long> selected = new HashSet<long>();
        readonly Dictionary<long, Package> packages = new Dictionary<long, Package>();
        PreviewCache? previews;
        string query = "";
        string searchedQuery = "";
        static readonly int AllKinds = (1 << Labels.Kinds.Length) - 1;
        int kindMask = AllKinds;
        float tileSize = 112f;
        SearchResult[] results = Array.Empty<SearchResult>();
        Status? status;
        string? notice;
        bool searching;
        bool busy;
        double searchAt = -1;
        double statusAt;
        Vector2 gridScroll;
        Vector2 detailScroll;
        GUIStyle? tileLabel;

        [MenuItem("Window/aredoko/アセット検索 %#k")]
        public static void Open()
        {
            var window = GetWindow<AredokoWindow>();
            window.titleContent = new GUIContent("aredoko", EditorGUIUtility.IconContent("Search Icon").image);
            window.minSize = new Vector2(640, 360);
            window.Show();
        }

        void OnEnable()
        {
            previews = new PreviewCache(Repaint);
            EditorApplication.update += Tick;
            statusAt = 0;
        }

        void OnDisable()
        {
            EditorApplication.update -= Tick;
            previews?.Dispose();
            previews = null;
        }

        void Tick()
        {
            var now = EditorApplication.timeSinceStartup;
            if (searchAt > 0 && now >= searchAt)
            {
                searchAt = -1;
                RunSearch();
            }

            if (now >= statusAt)
            {
                statusAt = now + StatusInterval;
                RefreshStatus();
            }
        }

        void OnGUI()
        {
            tileLabel ??= new GUIStyle(EditorStyles.miniLabel) { alignment = TextAnchor.UpperCenter, wordWrap = true, clipping = TextClipping.Clip };
            DrawToolbar();
            DrawStatus();
            using (new EditorGUILayout.HorizontalScope())
            {
                DrawResults();
                DrawDetail();
            }
        }

        void DrawToolbar()
        {
            using var _ = new EditorGUILayout.HorizontalScope(EditorStyles.toolbar);
            GUI.SetNextControlName("aredoko-query");
            var next = EditorGUILayout.TextField(query, EditorStyles.toolbarSearchField, GUILayout.MinWidth(200));
            if (next != query)
            {
                query = next;
                searchAt = EditorApplication.timeSinceStartup + SearchDelay;
            }

            if (Event.current.type == EventType.KeyDown && Event.current.keyCode == KeyCode.Return && GUI.GetNameOfFocusedControl() == "aredoko-query")
            {
                searchAt = -1;
                RunSearch();
                Event.current.Use();
            }

            if (GUILayout.Button(KindFilterLabel(), EditorStyles.toolbarDropDown, GUILayout.Width(120)))
            {
                ShowKindMenu();
            }

            tileSize = GUILayout.HorizontalSlider(tileSize, MinTile, MaxTile, GUILayout.Width(80));
            GUILayout.Space(6);
            using (new EditorGUI.DisabledScope(busy))
            {
                if (GUILayout.Button(new GUIContent("このプロジェクトを索引", "プロジェクト内のアセットも検索できるようにします"), EditorStyles.toolbarButton))
                {
                    IndexProject();
                }
            }
        }

        void DrawStatus()
        {
            string line;
            if (status == null)
            {
                line = "サーバーに接続しています…";
            }
            else if (status.Indexing)
            {
                line = $"索引を作成中: {status.Current ?? ""}　パッケージ {status.Packages.Done}/{status.Packages.Total}・画像 {status.Images.Done}/{status.Images.Total}";
            }
            else
            {
                line = $"パッケージ {status.Packages.Total} 件・画像 {status.Images.Total} 枚を検索できます（{(status.Device == "cpu" ? "CPU" : "GPU")}）";
            }

            if (notice != null)
            {
                EditorGUILayout.HelpBox(notice, MessageType.Info);
            }

            EditorGUILayout.LabelField(line, EditorStyles.miniLabel);
        }

        void DrawResults()
        {
            using var scroll = new EditorGUILayout.ScrollViewScope(gridScroll, GUILayout.ExpandWidth(true));
            gridScroll = scroll.scrollPosition;
            if (results.Length == 0)
            {
                var message = searching ? "検索しています…" : string.IsNullOrWhiteSpace(searchedQuery) ? "探したいアセットを日本語で入力してください（例: 黒い猫耳、桔梗 用のワンピース）" : "見つかりませんでした。別の言い方でもお試しください。";
                EditorGUILayout.LabelField(message, EditorStyles.centeredGreyMiniLabel, GUILayout.Height(60));
                return;
            }

            var width = position.width - DetailWidth - 24;
            var columns = Mathf.Max(1, Mathf.FloorToInt(width / (tileSize + 8)));
            for (var start = 0; start < results.Length; start += columns)
            {
                using (new EditorGUILayout.HorizontalScope())
                {
                    for (var index = start; index < Mathf.Min(start + columns, results.Length); index++)
                    {
                        DrawTile(results[index]);
                    }

                    GUILayout.FlexibleSpace();
                }
            }
        }

        void DrawTile(SearchResult result)
        {
            var rect = GUILayoutUtility.GetRect(tileSize + 4, tileSize + 34, GUILayout.Width(tileSize + 4));
            var isSelected = selected.Contains(result.AssetId);
            if (isSelected)
            {
                EditorGUI.DrawRect(rect, new Color(0.24f, 0.49f, 0.9f, 0.45f));
            }

            var image = new Rect(rect.x + 2, rect.y + 2, tileSize, tileSize);
            GUI.DrawTexture(image, previews!.Get(result), ScaleMode.ScaleToFit);
            if (result.PackageKind == PackageKind.Project)
            {
                GUI.Label(new Rect(image.x + 2, image.y + 2, 60, 16), "プロジェクト", EditorStyles.miniButton);
            }

            GUI.Label(new Rect(rect.x, image.yMax + 2, rect.width, 30), new GUIContent(Labels.FileName(result.Pathname), $"{result.Pathname}\n{result.PackageName}"), tileLabel);
            HandleTileEvent(rect, result);
        }

        void HandleTileEvent(Rect rect, SearchResult result)
        {
            var current = Event.current;
            if (current.type != EventType.MouseDown || !rect.Contains(current.mousePosition))
            {
                return;
            }

            if (current.clickCount == 2)
            {
                if (result.PackageKind == PackageKind.Project)
                {
                    Reveal(result);
                }
                else
                {
                    selected.Clear();
                    selected.Add(result.AssetId);
                    Import();
                }
            }
            else if (EditorGUI.actionKey || current.shift)
            {
                if (!selected.Remove(result.AssetId))
                {
                    selected.Add(result.AssetId);
                }
            }
            else
            {
                selected.Clear();
                selected.Add(result.AssetId);
            }

            LoadPackage(result.PackageId);
            current.Use();
            Repaint();
        }

        void DrawDetail()
        {
            using var _ = new EditorGUILayout.VerticalScope(EditorStyles.helpBox, GUILayout.Width(DetailWidth), GUILayout.ExpandHeight(true));
            using var scroll = new EditorGUILayout.ScrollViewScope(detailScroll);
            detailScroll = scroll.scrollPosition;
            var chosen = results.Where(result => selected.Contains(result.AssetId)).ToArray();
            if (chosen.Length == 0)
            {
                EditorGUILayout.LabelField("アセットを選ぶと詳細が表示されます。ダブルクリックでインポートします。", EditorStyles.wordWrappedMiniLabel);
                return;
            }

            var first = chosen[0];
            var preview = previews!.Get(first);
            var size = DetailWidth - 24;
            GUILayout.Label(preview, GUILayout.Width(size), GUILayout.Height(size));
            EditorGUILayout.LabelField(Labels.FileName(first.Pathname), EditorStyles.boldLabel);
            EditorGUILayout.LabelField(first.Pathname, EditorStyles.wordWrappedMiniLabel);
            Field("種類", Labels.Kind(first.Kind));
            if (chosen.Length > 1)
            {
                EditorGUILayout.LabelField($"ほか {chosen.Length - 1} 件を選択中", EditorStyles.miniLabel);
            }

            GUILayout.Space(8);
            DrawPackage(first);
            GUILayout.Space(8);
            DrawActions(chosen);
        }

        string KindFilterLabel()
        {
            var chosen = Labels.Kinds.Where((_, index) => (kindMask & (1 << index)) != 0).ToArray();
            if ((kindMask & AllKinds) == AllKinds || chosen.Length == 0)
            {
                return "すべての種類";
            }

            return chosen.Length == 1 ? Labels.Kind(chosen[0]) : $"{chosen.Length} 種類";
        }

        void ShowKindMenu()
        {
            var menu = new GenericMenu();
            menu.AddItem(new GUIContent("すべての種類"), (kindMask & AllKinds) == AllKinds, () => SetKindMask(AllKinds));
            menu.AddSeparator(string.Empty);
            for (var index = 0; index < Labels.Kinds.Length; index++)
            {
                var bit = 1 << index;
                var only = (kindMask & AllKinds) == AllKinds;
                menu.AddItem(new GUIContent(Labels.Kind(Labels.Kinds[index])), !only && (kindMask & bit) != 0, () => SetKindMask(only ? bit : kindMask ^ bit));
            }

            menu.ShowAsContext();
        }

        void SetKindMask(int mask)
        {
            kindMask = (mask & AllKinds) == 0 ? AllKinds : mask & AllKinds;
            RunSearch();
        }

        static void Field(string label, string value)
        {
            EditorGUILayout.LabelField(label, EditorStyles.miniBoldLabel);
            EditorGUILayout.LabelField(value, EditorStyles.wordWrappedLabel);
        }

        void DrawPackage(SearchResult result)
        {
            EditorGUILayout.LabelField("パッケージ", EditorStyles.boldLabel);
            EditorGUILayout.LabelField(result.PackageName, EditorStyles.wordWrappedLabel);
            if (!packages.TryGetValue(result.PackageId, out var package))
            {
                return;
            }

            var summary = package.Summary;
            if (summary.Avatars.Length > 0)
            {
                Field("対応アバター", string.Join("、", summary.Avatars));
            }

            if (summary.Shaders.Length > 0)
            {
                Field("シェーダー", string.Join("、", summary.Shaders));
            }

            if (summary.Colors.Length > 0)
            {
                Field("色", string.Join("、", summary.Colors));
            }

            var counts = summary.Counts.Where(count => count.Kind != AssetKind.Other).Select(count => $"{Labels.Kind(count.Kind)} {count.Count}");
            EditorGUILayout.LabelField(string.Join("・", counts), EditorStyles.wordWrappedMiniLabel);
            if (package.Booth != null)
            {
                EditorGUILayout.LabelField($"BOOTH: {package.Booth.Name}", EditorStyles.wordWrappedMiniLabel);
                EditorGUILayout.LabelField($"{package.Booth.Shop}・{package.Booth.Price}", EditorStyles.miniLabel);
                if (GUILayout.Button("BOOTH の商品ページを開く"))
                {
                    Application.OpenURL(package.Booth.Url);
                }
            }
        }

        void DrawActions(SearchResult[] chosen)
        {
            var external = chosen.Where(result => result.PackageKind == PackageKind.Unitypackage).ToArray();
            using (new EditorGUI.DisabledScope(busy || external.Length == 0))
            {
                if (GUILayout.Button(external.Length > 1 ? $"選んだ {external.Length} 件をインポート" : "インポート", GUILayout.Height(28)))
                {
                    Import();
                }
            }

            if (chosen.Length == 1 && chosen[0].PackageKind == PackageKind.Project && GUILayout.Button("プロジェクトで表示"))
            {
                Reveal(chosen[0]);
            }
        }

        static void Reveal(SearchResult result)
        {
            var path = AssetDatabase.GUIDToAssetPath(result.Guid);
            var asset = string.IsNullOrEmpty(path) ? null : AssetDatabase.LoadMainAssetAtPath(path);
            if (asset == null)
            {
                return;
            }

            Selection.activeObject = asset;
            EditorGUIUtility.PingObject(asset);
        }

        async void RunSearch()
        {
            var text = query.Trim();
            searchedQuery = text;
            if (text.Length == 0)
            {
                results = Array.Empty<SearchResult>();
                selected.Clear();
                Repaint();
                return;
            }

            searching = true;
            Repaint();
            try
            {
                var kinds = (kindMask & AllKinds) == AllKinds ? Array.Empty<AssetKind>() : Labels.Kinds.Where((_, index) => (kindMask & (1 << index)) != 0).ToArray();
                var found = await AredokoClient.Shared.Call(AredokoRpcs.Search, new SearchPayload { Query = text, Limit = ResultLimit, Kinds = kinds });
                if (text == searchedQuery)
                {
                    results = found.Results;
                    selected.IntersectWith(results.Select(result => result.AssetId));
                    notice = null;
                    gridScroll = Vector2.zero;
                }
            }
            catch (AredokoException exception)
            {
                notice = exception.Message;
            }
            finally
            {
                searching = false;
                Repaint();
            }
        }

        async void RefreshStatus()
        {
            try
            {
                status = await AredokoClient.Shared.Call(AredokoRpcs.GetStatus);
                if (notice != null && notice.StartsWith("aredoko の管理アプリ", StringComparison.Ordinal))
                {
                    notice = null;
                }
            }
            catch (AredokoException exception)
            {
                status = null;
                notice = exception.Message;
            }

            Repaint();
        }

        async void LoadPackage(long packageId)
        {
            if (packages.ContainsKey(packageId))
            {
                return;
            }

            try
            {
                packages[packageId] = await AredokoClient.Shared.Call(AredokoRpcs.GetPackage, new GetPackagePayload { Id = packageId });
                Repaint();
            }
            catch (AredokoException exception)
            {
                notice = exception.Message;
            }
        }

        async void Import()
        {
            var ids = results.Where(result => selected.Contains(result.AssetId) && result.PackageKind == PackageKind.Unitypackage).Select(result => result.AssetId).ToArray();
            if (ids.Length == 0)
            {
                return;
            }

            busy = true;
            try
            {
                var extracted = await AredokoClient.Shared.Call(AredokoRpcs.Extract, new ExtractPayload { AssetIds = ids });
                notice = extracted.Missing.Length > 0
                    ? $"{extracted.Assets} 個のファイルを取り出しました。元のパッケージに無い参照が {extracted.Missing.Length} 件あります。シェーダーなど別のパッケージが必要かもしれません。"
                    : $"{extracted.Assets} 個のファイルを取り出しました。";
                AssetDatabase.ImportPackage(extracted.Path, true);
            }
            catch (AredokoException exception)
            {
                notice = exception.Message;
            }
            finally
            {
                busy = false;
                Repaint();
            }
        }

        async void IndexProject()
        {
            busy = true;
            try
            {
                var count = await ProjectIndexer.Run(progress => notice = progress);
                notice = $"プロジェクトの {count} 個のアセットを索引に追加しました。";
            }
            catch (AredokoException exception)
            {
                notice = exception.Message;
            }
            finally
            {
                busy = false;
                Repaint();
            }
        }
    }
}
