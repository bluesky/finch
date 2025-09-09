export const replaceArgs = (templateString: string, args: Record<string, any>): string => {
    if (!templateString) return '';
    // Split the string by placeholders while keeping the parts
    const parts: string[] = [];
    let lastIndex = 0;

    templateString.replace(/\$\(([^)]+)\)/g, (match, key, offset) => {
      // Add any literal text before this placeholder
      if (offset > lastIndex) {
        parts.push(templateString.slice(lastIndex, offset));
      }

      // Add the replacement value with colons removed
      if (args[key] !== undefined) {
        const value = String(args[key]).replace(/:/g, ''); // Remove all colons
        parts.push(value);
      } else {
        parts.push(match);
      }

      lastIndex = offset + match.length;
      return match;
    });

    // Add any remaining literal text after the last placeholder
    if (lastIndex < templateString.length) {
      parts.push(templateString.slice(lastIndex));
    }

    // Join all parts with ":"
    return parts.filter(part => part.length > 0).join(":");
  };
