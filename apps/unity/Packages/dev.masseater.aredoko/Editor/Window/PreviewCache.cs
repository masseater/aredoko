#nullable enable

using System;
using System.Collections.Generic;
using Aredoko.Client;
using Aredoko.Protocol;
using UnityEditor;
using UnityEngine;

namespace Aredoko.Window
{
    sealed class PreviewCache : IDisposable
    {
        readonly Dictionary<long, Texture2D?> textures = new Dictionary<long, Texture2D?>();
        readonly Action repaint;

        public PreviewCache(Action repaint)
        {
            this.repaint = repaint;
        }

        public Texture Get(SearchResult result)
        {
            if (result.PackageKind == PackageKind.Project)
            {
                return ProjectPreview(result);
            }

            if (!result.HasPreview)
            {
                return Labels.Icon(result.Kind);
            }

            if (textures.TryGetValue(result.AssetId, out var texture))
            {
                return texture != null ? texture : Labels.Icon(result.Kind);
            }

            textures[result.AssetId] = null;
            Load(result.AssetId);
            return Labels.Icon(result.Kind);
        }

        public void Dispose()
        {
            foreach (var texture in textures.Values)
            {
                if (texture != null)
                {
                    UnityEngine.Object.DestroyImmediate(texture);
                }
            }

            textures.Clear();
        }

        static Texture ProjectPreview(SearchResult result)
        {
            var path = AssetDatabase.GUIDToAssetPath(result.Guid);
            var asset = string.IsNullOrEmpty(path) ? null : AssetDatabase.LoadMainAssetAtPath(path);
            if (asset == null)
            {
                return Labels.Icon(result.Kind);
            }

            var preview = AssetPreview.GetAssetPreview(asset);
            return preview != null ? preview : AssetPreview.GetMiniThumbnail(asset);
        }

        async void Load(long assetId)
        {
            try
            {
                var preview = await AredokoClient.Shared.Call(AredokoRpcs.GetPreview, new GetPreviewPayload { AssetId = assetId });
                var texture = new Texture2D(2, 2) { hideFlags = HideFlags.HideAndDontSave };
                if (texture.LoadImage(Convert.FromBase64String(preview.Png)))
                {
                    textures[assetId] = texture;
                }
                else
                {
                    UnityEngine.Object.DestroyImmediate(texture);
                }
            }
            catch (AredokoException)
            {
            }

            repaint();
        }
    }
}
