// Environment variable diagnostic endpoint
export async function GET(request) {
  try {
    console.log("[ENV_CHECK] Starting environment variable diagnostic...");

    // Check all environment variables that contain 'UPLOAD'
    const uploadVars = Object.keys(process.env)
      .filter((key) => key.includes("UPLOAD"))
      .reduce((obj, key) => {
        // Show first 10 characters of the value for security
        const value = process.env[key];
        obj[key] = {
          exists: !!value,
          hasValue: value && value.length > 0,
          valuePreview: value ? `${value.substring(0, 10)}...` : "undefined",
          length: value ? value.length : 0,
        };
        return obj;
      }, {});

    // Check the specific variable we need
    const uploadcareKey = process.env.EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY;

    const diagnostics = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      env: process.env.ENV,
      uploadcareStatus: {
        keyExists: !!uploadcareKey,
        keyHasValue: uploadcareKey && uploadcareKey.length > 0,
        keyLength: uploadcareKey ? uploadcareKey.length : 0,
        keyPreview: uploadcareKey
          ? `${uploadcareKey.substring(0, 10)}...`
          : "not found",
      },
      allUploadVariables: uploadVars,
      totalEnvVars: Object.keys(process.env).length,
      suggestion: null,
    };

    // Add suggestions based on the findings
    if (!uploadcareKey) {
      diagnostics.suggestion =
        "EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY is not set. This should be configured in your environment.";
    } else if (!uploadcareKey.length) {
      diagnostics.suggestion =
        "EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY exists but is empty. Please set a valid Uploadcare public key.";
    } else {
      diagnostics.suggestion =
        "Uploadcare key appears to be configured correctly!";
    }

    console.log(
      "[ENV_CHECK] Diagnostics:",
      JSON.stringify(diagnostics, null, 2),
    );

    return Response.json({
      status: "success",
      diagnostics,
    });
  } catch (error) {
    console.error("[ENV_CHECK] Error:", error);
    return Response.json(
      {
        status: "error",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}

// Test endpoint to try Uploadcare upload
export async function POST(request) {
  try {
    const { testUpload } = await request.json();

    if (!testUpload) {
      return Response.json(
        { error: "Include testUpload: true in request body" },
        { status: 400 },
      );
    }

    const uploadcareKey = process.env.EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY;

    if (!uploadcareKey) {
      return Response.json({
        success: false,
        error: "EXPO_PUBLIC_UPLOADCARE_PUBLIC_KEY not found",
        suggestion:
          "Configure the Uploadcare public key in environment variables",
      });
    }

    // Create a test file for upload
    const testContent =
      "This is a test file for Uploadcare upload verification";
    const testBlob = new Blob([testContent], { type: "text/plain" });

    const formData = new FormData();
    formData.append("UPLOADCARE_PUB_KEY", uploadcareKey);
    formData.append("file", testBlob, "uploadcare-test.txt");

    console.log("[ENV_CHECK] Attempting test upload to Uploadcare...");
    console.log(
      "[ENV_CHECK] Using key:",
      `${uploadcareKey.substring(0, 10)}...`,
    );

    const uploadResponse = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    console.log("[ENV_CHECK] Upload response status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("[ENV_CHECK] Upload failed:", errorText);
      return Response.json({
        success: false,
        error: `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        details: errorText,
      });
    }

    const uploadData = await uploadResponse.json();
    const cdnUrl = `https://ucarecdn.com/${uploadData.file}/`;

    console.log("[ENV_CHECK] Upload successful:", cdnUrl);

    return Response.json({
      success: true,
      message: "Uploadcare test upload successful!",
      testFileUrl: cdnUrl,
      uploadData,
    });
  } catch (error) {
    console.error("[ENV_CHECK] Test upload error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
