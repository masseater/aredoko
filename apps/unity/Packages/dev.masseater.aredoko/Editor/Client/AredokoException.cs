#nullable enable

using System;

namespace Aredoko.Client
{
    public sealed class AredokoException : Exception
    {
        public AredokoException(string message, bool unreachable = false)
            : base(message)
        {
            Unreachable = unreachable;
        }

        public bool Unreachable { get; }
    }
}
