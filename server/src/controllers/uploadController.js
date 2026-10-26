export async function uploadMedia(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      if (req.file) {
        req.files = [req.file];
      } else {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded. Please select an image.',
        });
      }
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const mediaList = req.files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      path: `/uploads/${file.filename}`,
      filename: file.filename,
      type: 'image',
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.status(200).json({
      success: true,
      message: `${mediaList.length} image(s) uploaded successfully`,
      media: mediaList,
    });
  } catch (error) {
    next(error);
  }
}
